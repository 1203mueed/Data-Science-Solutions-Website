# scripts/execute_cell.py

import sys
import nbformat
from jupyter_client import KernelManager
import json
import uuid
import time

def assign_ids(nb):
    """
    Recursively assign unique 'id's to notebook cells if they are missing.
    """
    for i, cell in enumerate(nb.cells):
        if 'id' not in cell.metadata:
            cell.metadata['id'] = str(uuid.uuid4())
            print(f"Assigned new id to cell {i}: {cell.metadata['id']}", file=sys.stderr)
        # Handle nested cells if any (e.g., for notebook extensions)
        if 'cells' in cell:
            assign_ids(cell)

def execute_cell(notebook_path, cell_index):
    """
    Execute a specific cell in a Jupyter Notebook using jupyter_client.
    """
    try:
        # Load the notebook
        with open(notebook_path, 'r', encoding='utf-8') as f:
            nb = nbformat.read(f, as_version=4)

        # Assign 'id's if missing
        assign_ids(nb)

        # Save the notebook with updated 'id's
        with open(notebook_path, 'w', encoding='utf-8') as f:
            nbformat.write(nb, f)

        # Initialize the Kernel Manager
        km = KernelManager(kernel_name='python3')
        km.start_kernel()
        kc = km.client()
        kc.start_channels()

        # Wait for the kernel to be ready
        kc.wait_for_ready(timeout=60)

        # Get the cell to execute
        if cell_index < 0 or cell_index >= len(nb.cells):
            raise IndexError("Cell index out of range.")

        cell = nb.cells[cell_index]
        if cell.cell_type != 'code':
            raise ValueError("Only code cells can be executed.")

        code = cell.source

        # Execute the code
        kc.execute(code)

        # Collect output
        outputs = []
        while True:
            try:
                msg = kc.get_iopub_msg(timeout=60)
            except Exception as e:
                print(json.dumps({'error': 'Timeout waiting for message'}))
                km.shutdown_kernel(now=True)
                sys.exit(1)

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

        # Shutdown the kernel
        km.shutdown_kernel(now=True)

        # Output the results
        print(json.dumps({'outputs': outputs}))

    except Exception as e:
        print(json.dumps({'error': str(e)}))
        sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print(json.dumps({'error': 'Usage: execute_cell.py <notebook_path> <cell_index>'}))
        sys.exit(1)

    notebook_path = sys.argv[1]
    try:
        cell_index = int(sys.argv[2])
    except ValueError:
        print(json.dumps({'error': 'cell_index must be an integer.'}))
        sys.exit(1)

    execute_cell(notebook_path, cell_index)
