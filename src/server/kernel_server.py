# kernel_server.py

from flask import Flask, request, jsonify
from jupyter_client import KernelManager
import nbformat
import uuid
import os
import threading
import sys  # Import sys for logging to stderr

app = Flask(__name__)

# Dictionary to hold kernel managers per notebook
kernels = {}
lock = threading.Lock()

def assign_ids(nb):
    """
    Assign unique 'id's to notebook cells if they are missing.
    """
    for i, cell in enumerate(nb.cells):
        if 'id' not in cell.metadata:
            cell.metadata['id'] = str(uuid.uuid4())
            print(f"Assigned new id to cell {i}: {cell.metadata['id']}", file=sys.stderr)

@app.route('/init_kernel', methods=['POST'])
def init_kernel():
    data = request.json
    notebook_path = data.get('notebook_path')

    if not notebook_path:
        return jsonify({'error': 'notebook_path is required.'}), 400

    with lock:
        if notebook_path in kernels:
            return jsonify({'message': 'Kernel already exists for this notebook.'}), 200

        try:
            notebook_dir = os.path.dirname(os.path.abspath(notebook_path))
            print(f"Initializing kernel for notebook: {notebook_path} with cwd: {notebook_dir}", file=sys.stderr)
            
            km = KernelManager(kernel_name='python3')
            km.start_kernel(cwd=notebook_dir)  # Set the working directory to notebook's directory
            kc = km.client()
            kc.start_channels()
            kc.wait_for_ready(timeout=60)
            kernels[notebook_path] = km
            print(f"Kernel initialized for notebook: {notebook_path}", file=sys.stderr)
            return jsonify({'message': 'Kernel started successfully.'}), 200
        except Exception as e:
            print(f"Exception during kernel initialization: {str(e)}", file=sys.stderr)
            return jsonify({'error': f'Failed to start kernel: {str(e)}'}), 500

@app.route('/execute_cell', methods=['POST'])
def execute_cell_endpoint():
    data = request.json
    notebook_path = data.get('notebook_path')
    cell_index = data.get('cell_index')

    if not notebook_path or cell_index is None:
        return jsonify({'error': 'notebook_path and cell_index are required.'}), 400

    with lock:
        if notebook_path not in kernels:
            return jsonify({'error': 'Kernel not initialized for this notebook.'}), 400

        km = kernels[notebook_path]
        kc = km.client()

    # Load the notebook
    try:
        with open(notebook_path, 'r', encoding='utf-8') as f:
            nb = nbformat.read(f, as_version=4)
        print(f"Loaded notebook: {notebook_path}", file=sys.stderr)
    except Exception as e:
        print(f"Failed to read notebook: {str(e)}", file=sys.stderr)
        return jsonify({'error': f'Failed to read notebook: {str(e)}'}), 500

    # Assign 'id's if missing
    try:
        assign_ids(nb)
        # Save the notebook with updated 'id's
        with open(notebook_path, 'w', encoding='utf-8') as f:
            nbformat.write(nb, f)
        print(f"Notebook after assigning IDs: {notebook_path}", file=sys.stderr)
    except Exception as e:
        print(f"Failed to assign IDs: {str(e)}", file=sys.stderr)
        return jsonify({'error': f'Failed to assign IDs: {str(e)}'}), 500

    # Get the cell to execute
    try:
        cell_index = int(cell_index)
        if cell_index < 0 or cell_index >= len(nb.cells):
            raise IndexError('Cell index out of range.')
        cell = nb.cells[cell_index]
        if cell.cell_type != 'code':
            raise ValueError('Only code cells can be executed.')
        code = cell.source
        print(f"Executing cell {cell_index}: {code}", file=sys.stderr)
    except Exception as e:
        print(f"Error retrieving cell: {str(e)}", file=sys.stderr)
        return jsonify({'error': str(e)}), 400

    # Execute the code
    try:
        kc.execute(code)
        outputs = []
        while True:
            try:
                msg = kc.get_iopub_msg(timeout=60)
            except Exception as e:
                print(f"Timeout waiting for message: {str(e)}", file=sys.stderr)
                return jsonify({'error': 'Timeout waiting for message.'}), 500

            msg_type = msg['header']['msg_type']
            content = msg['content']

            if msg_type == 'stream':
                outputs.append(content.get('text', ''))
            elif msg_type == 'execute_result':
                data = content.get('data', {})
                outputs.append(data.get('text/plain', ''))
            elif msg_type == 'error':
                traceback = '\n'.join(content.get('traceback', []))
                outputs.append(traceback)
            elif msg_type == 'status' and content.get('execution_state') == 'idle':
                break

        print(f"Execution outputs: {outputs}", file=sys.stderr)
        return jsonify({'outputs': outputs}), 200

    except Exception as e:
        print(f"Failed to execute cell: {str(e)}", file=sys.stderr)
        return jsonify({'error': f'Failed to execute cell: {str(e)}'}), 500

@app.route('/shutdown_kernel', methods=['POST'])
def shutdown_kernel_endpoint():
    data = request.json
    notebook_path = data.get('notebook_path')

    if not notebook_path:
        return jsonify({'error': 'notebook_path is required.'}), 400

    with lock:
        if notebook_path not in kernels:
            return jsonify({'error': 'Kernel not initialized for this notebook.'}), 400

        try:
            km = kernels.pop(notebook_path)
            km.shutdown_kernel(now=True)
            print(f"Kernel shutdown for notebook: {notebook_path}", file=sys.stderr)
            return jsonify({'message': 'Kernel shutdown successfully.'}), 200
        except Exception as e:
            print(f"Failed to shutdown kernel: {str(e)}", file=sys.stderr)
            return jsonify({'error': f'Failed to shutdown kernel: {str(e)}'}), 500

if __name__ == '__main__':
    app.run(port=5001, debug=False)