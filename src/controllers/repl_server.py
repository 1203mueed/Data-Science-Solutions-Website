# repl_server.py

import sys
import traceback
import io

def main():
    namespace = {}
    while True:
        try:
            # Read a line indicating the length of the incoming code
            length_line = sys.stdin.readline()
            if not length_line:
                break  # EOF

            length = int(length_line.strip())
            if length == 0:
                continue  # Skip empty commands

            # Read the code based on the specified length
            code = sys.stdin.read(length)
            # Debug: Print received code
            # print(f"Received code: {code}", file=sys.stderr)

            # Redirect stdout and stderr to capture outputs
            old_stdout = sys.stdout
            old_stderr = sys.stderr
            redirected_output = io.StringIO()
            redirected_error = io.StringIO()
            sys.stdout = redirected_output
            sys.stderr = redirected_error

            try:
                exec(code, namespace)
            except Exception:
                traceback.print_exc(file=redirected_error)

            # Restore original stdout and stderr
            sys.stdout = old_stdout
            sys.stderr = old_stderr

            # Get outputs
            output = redirected_output.getvalue()
            error = redirected_error.getvalue()

            # Send back the lengths and content of output and error
            # Protocol:
            # <OUTPUT_LENGTH>\n<OUTPUT>
            # <ERROR_LENGTH>\n<ERROR>
            sys.stdout.write(f"{len(output)}\n{output}")
            sys.stdout.write(f"{len(error)}\n{error}")
            sys.stdout.flush()

        except Exception as e:
            # In case of unexpected errors in the server
            sys.stdout.write(f"0\n\n0\n{str(e)}\n")
            sys.stdout.flush()

if __name__ == "__main__":
    main()
