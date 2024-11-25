# scripts/execute_notebook.py

import sys
import nbformat
from nbclient import NotebookClient
import json
import uuid  # Import UUID for manual ID assignment

def main(notebook_path, cell_indices=None):
    try:
        # Debug: Print Python version and nbformat path
        print(f"Python version: {sys.version}")
        print(f"nbformat version: {nbformat.__version__}")
        print(f"nbformat file: {nbformat.__file__}")

        # Load the notebook
        with open(notebook_path, 'r', encoding='utf-8') as f:
            nb = nbformat.read(f, as_version=4)

        # Debug: Print cells' metadata before normalization
        print("Before normalization:")
        for i, cell in enumerate(nb.cells):
            print(f"Cell {i} metadata:", cell.metadata)

        # Manually assign 'id's if missing
        for i, cell in enumerate(nb.cells):
            if 'id' not in cell.metadata:
                cell.metadata['id'] = str(uuid.uuid4())
                print(f"Assigned new id to cell {i}: {cell.metadata['id']}")

        # Debug: Print cells' metadata after manual assignment
        print("\nAfter manual assignment:")
        for i, cell in enumerate(nb.cells):
            print(f"Cell {i} metadata:", cell.metadata)

        # Create a NotebookClient
        client = NotebookClient(nb, timeout=600, kernel_name='python3')

        # Execute the notebook or specific cells
        if cell_indices:
            cell_indices = [int(idx) for idx in cell_indices.split(',')]
            # Execute specific cells
            for idx in cell_indices:
                if 0 <= idx < len(nb.cells):
                    cell = nb.cells[idx]
                    if cell.cell_type == 'code':
                        client.execute_cell(cell, idx)
                else:
                    raise IndexError(f"Cell index {idx} is out of range.")
        else:
            # Execute the entire notebook
            client.execute()

        # Save the executed notebook
        with open(notebook_path, 'w', encoding='utf-8') as f:
            nbformat.write(nb, f)

        # Extract outputs
        outputs = []
        for cell in nb.cells:
            if cell.cell_type == 'code':
                output_text = ''
                for output in cell.get('outputs', []):
                    if output.output_type == 'stream':
                        output_text += output.get('text', '')
                    elif output.output_type == 'error':
                        output_text += ''.join(output.get('traceback', ''))
                    elif output.output_type in ['execute_result', 'display_data']:
                        data = output.get('data', {})
                        output_text += data.get('text/plain', '')
                outputs.append(output_text)
            else:
                outputs.append('')  # Non-code cells have no outputs

        # Return outputs as JSON
        print(json.dumps({'outputs': outputs}))

    except Exception as e:
        print(json.dumps({'error': str(e)}))
        sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({'error': 'Not enough arguments. Usage: execute_notebook.py <notebook_path> [cell_indices]'}))
        sys.exit(1)

    notebook_path = sys.argv[1]
    cell_indices = sys.argv[2] if len(sys.argv) > 2 else None
    main(notebook_path, cell_indices)
