// src/components/Notebook.js

import React, { useEffect, useState } from 'react';
import {
  FaTrash,
  FaPlay,
  FaPlus,
  FaSpinner,
  FaCheckCircle,
  FaTimesCircle,
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import '../styles/Notebook.css';
import CodeMirror from '@uiw/react-codemirror';
import { dracula } from '@uiw/codemirror-theme-dracula';
import { python } from '@codemirror/lang-python';
import ReactMarkdown from 'react-markdown';

const Notebook = ({ projectId, trainingId, user }) => {
  const [cells, setCells] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch initial cells and training session details
  useEffect(() => {
    const fetchCells = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `http://localhost:5000/api/federated-training/${projectId}/trainings/${trainingId}/cells`
        );
        const data = await response.json();

        if (response.ok) {
          const fetchedCells = Array.isArray(data.cells) ? data.cells : [];
          setCells(fetchedCells);
        } else {
          throw new Error(data.error || 'Failed to fetch cells.');
        }
      } catch (err) {
        console.error('Error fetching cells:', err.message);
        toast.error('Failed to load cells.');
      } finally {
        setIsLoading(false);
      }
    };

    const fetchTrainingSessionDetails = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/api/federated-training/${projectId}/trainings/${trainingId}`
        );
        const data = await response.json();

        if (response.ok) {
          const trainingSession = data.trainingSession;
          // Additional logic if needed
        } else {
          throw new Error(data.error || 'Failed to fetch training session details.');
        }
      } catch (err) {
        console.error('Error fetching training session details:', err.message);
        toast.error('Failed to load training session details.');
      }
    };

    fetchCells();
    fetchTrainingSessionDetails();
  }, [projectId, trainingId]);

  /**
   * Handle updating the cell code both locally and on the backend.
   */
  const handleLocalCodeChange = async (cellId, newCode) => {
    // Optimistically update the local state
    setCells((prevCells) =>
      prevCells.map((c) =>
        c.cellId === cellId
          ? { ...c, code: newCode, status: 'pending', output: '' }
          : c
      )
    );

    try {
      const response = await fetch(
        `http://localhost:5000/api/federated-training/${projectId}/trainings/${trainingId}/cells/${cellId}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ newCode }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update cell.');
      }

      // Removed toast notification as per your request
    } catch (err) {
      console.error('Error updating cell:', err.message);
      toast.error('Failed to update cell.');
    }
  };

  /**
   * Handle executing a code cell.
   */
  const handleExecuteCell = async (cellId) => {
    const cell = cells.find((c) => c.cellId === cellId);
    if (!cell) {
      return toast.error('Cell not found.');
    }

    if (cell.type !== 'code') {
      return toast.error('Only code cells can be executed.');
    }

    if (!cell.code.trim()) {
      return toast.error('Cannot execute empty code.');
    }

    try {
      // Immediately set the cell status to 'reviewing' for instant feedback
      setCells((prevCells) =>
        prevCells.map((c) =>
          c.cellId === cellId
            ? { ...c, status: 'reviewing', output: 'Reviewing code with Gemini AI...' }
            : c
        )
      );

      // Prepare the specific cell for approval
      const cellToApprove = { cellId: cell.cellId, code: cell.code };

      const approvalResponse = await fetch(
        `http://localhost:5000/api/federated-training/${projectId}/trainings/${trainingId}/approve`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cells: [cellToApprove] }), // Send only the specific cell
        }
      );

      const approvalData = await approvalResponse.json();

      console.log('Approval Data:', approvalData);

      if (!approvalResponse.ok) {
        throw new Error(approvalData.error || 'Failed to approve code.');
      }

      const cellApproval = approvalData[0]; // Since only one cell was sent

      if (!cellApproval || cellApproval.approved === undefined) {
        throw new Error(`No approval result found for the cell with ID: ${cellId}`);
      }

      if (!cellApproval.approved) {
        // Update the specific cell as rejected
        setCells((prevCells) =>
          prevCells.map((c) =>
            c.cellId === cellId
              ? {
                  ...c,
                  approved: false,
                  rejectionReason: cellApproval.reason,
                  status: 'rejected',
                }
              : c
          )
        );
        toast.error(`Cell execution rejected: ${cellApproval.reason}`);
        return;
      }

      // Update cell status to 'executing' to indicate Gemini AI has approved
      setCells((prevCells) =>
        prevCells.map((c) =>
          c.cellId === cellId
            ? { ...c, status: 'executing', output: 'Executing...' }
            : c
        )
      );

      // Send POST request to execute the cell
      const executeResponse = await fetch(
        `http://localhost:5000/api/federated-training/${projectId}/trainings/${trainingId}/cells/${cellId}/execute`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        }
      );

      const executeData = await executeResponse.json();

      if (executeResponse.ok) {
        if (executeData.error) {
          // Handle execution error by setting cell output and status
          setCells((prevCells) =>
            prevCells.map((c) =>
              c.cellId === cellId
                ? { ...c, output: executeData.error, status: 'error' }
                : c
            )
          );
        } else {
          // Handle successful execution by setting cell output and status
          setCells((prevCells) =>
            prevCells.map((c) =>
              c.cellId === cellId
                ? { ...c, output: executeData.output, status: 'executed', approved: true }
                : c
            )
          );
          toast.success('Cell executed successfully.');
        }
      } else {
        throw new Error(executeData.error || 'Execution failed.');
      }
    } catch (err) {
      console.error('Error executing cell:', err.message);
      setCells((prevCells) =>
        prevCells.map((c) =>
          c.cellId === cellId
            ? { ...c, output: 'Execution failed.', status: 'error' }
            : c
        )
      );
      toast.error('Error executing cell.');
    }
  };

  /**
   * Handle adding a new cell.
   */
  const handleAddCell = async (type) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/federated-training/${projectId}/trainings/${trainingId}/cells`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type }), // Specify the type of cell
        }
      );

      if (response.ok) {
        const data = await response.json();
        setCells((prevCells) => [...prevCells, data.cell]);
        toast.success(`New ${type} cell added successfully.`);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add cell.');
      }
    } catch (err) {
      toast.error(err.message || 'Error adding cell.');
    }
  };

  /**
   * Handle deleting a cell.
   */
  const handleDeleteCell = async (cellId) => {
    if (!window.confirm('Are you sure you want to delete this cell?')) return;

    try {
      const response = await fetch(
        `http://localhost:5000/api/federated-training/${projectId}/trainings/${trainingId}/cells/${cellId}`,
        { method: 'DELETE' }
      );

      if (response.ok) {
        setCells((prevCells) => prevCells.filter((c) => c.cellId !== cellId));
        toast.success('Cell deleted successfully.');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete cell.');
      }
    } catch (err) {
      toast.error(err.message || 'Error deleting cell.');
    }
  };

  /**
   * Render a single cell based on its type and approval status.
   */
  const renderCell = (cell) => {
    console.log(`Rendering cell ${cell.cellId}: Approved - ${cell.approved}`);
    return (
      <div key={cell.cellId} className={`cell ${cell.type}`}>
        {cell.type === 'code' ? (
          <CodeMirror
            value={cell.code || ''}
            extensions={[python()]}
            theme={dracula}
            onChange={(value, viewUpdate) =>
              handleLocalCodeChange(cell.cellId, value)
            }
            disabled={
              !user || (user.role !== 'editor' && user.role !== 'reviewer')
            }
            // Only allow editing if user is editor or reviewer
          />
        ) : (
          <ReactMarkdown className="markdown-cell">{cell.code || ''}</ReactMarkdown>
        )}

        <div className="cell-controls">
          {/* Execute Button for Code Cells */}
          {cell.type === 'code' && (
            <button
              onClick={() => handleExecuteCell(cell.cellId)}
              disabled={cell.status === 'reviewing' || cell.status === 'executing'}
              className={`execute-btn ${
                cell.status === 'reviewing' || cell.status === 'executing' ? 'disabled' : ''
              }`}
            >
              {(cell.status === 'reviewing' || cell.status === 'executing') ? (
                <FaSpinner className="spinner" />
              ) : (
                <FaPlay />
              )}{' '}
              {(cell.status === 'reviewing') ? 'Reviewing...' :
               (cell.status === 'executing') ? 'Executing...' : 'Execute'}
            </button>
          )}

          {/* Delete Button */}
          <button
            onClick={() => handleDeleteCell(cell.cellId)}
            className="delete-btn"
          >
            <FaTrash /> Delete
          </button>

          {/* Approval Status */}
          <div className="approval-status">
            {cell.status === 'executed' && cell.approved && (
              <>
                <FaCheckCircle color="#28a745" />
                <span>Approved</span>
              </>
            )}
            {cell.status === 'rejected' && !cell.approved && (
              <>
                <FaTimesCircle color="#dc3545" />
                <span>Rejected</span>
              </>
            )}
            {cell.status === 'reviewing' || cell.status === 'executing' ? (
              <>
                <FaSpinner className="spinner" />
                <span>{cell.status === 'reviewing' ? 'Reviewing' : 'Executing'}</span>
              </>
            ) : null}
          </div>
        </div>

        {/* Display Output */}
        {cell.output && <div className="cell-output">{cell.output}</div>}

        {/* Display Error */}
        {cell.status === 'error' && (
          <div className="cell-error">Error: {cell.output}</div>
        )}

        {/* Display Rejection Reason */}
        {cell.status === 'rejected' && cell.rejectionReason && (
          <div className="cell-rejection">
            <strong>Rejection Reason:</strong> {cell.rejectionReason}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="notebook">
      <div className="notebook-header">
        <h2>Notebook</h2>
        <div className="add-cell-buttons">
          <button
            className="add-cell-btn"
            onClick={() => handleAddCell('code')}
          >
            <FaPlus /> Add Code Cell
          </button>
          <button
            className="add-cell-btn"
            onClick={() => handleAddCell('markdown')}
          >
            <FaPlus /> Add Markdown Cell
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="loading">
          <FaSpinner className="spinner" /> Loading...
        </div>
      ) : cells.length > 0 ? (
        cells.map((cell) => renderCell(cell))
      ) : (
        <p>No cells available. Add one to get started!</p>
      )}
    </div>
  );
};

export default Notebook;
