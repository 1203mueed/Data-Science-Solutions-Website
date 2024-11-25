# repl_server.py

import sys
import traceback
import io
import os

def main():
    # Print Python version and executable path to stderr for debugging
    print(f"Python version: {sys.version}", file=sys.stderr)
    print(f"Python executable: {sys.executable}", file=sys.stderr)
    
    # List all installed third-party packages for verification
    try:
        import pkg_resources
        installed_packages = sorted(["%s==%s" % (i.key, i.version) for i in pkg_resources.working_set])
        print(f"Installed packages: {', '.join(installed_packages)}", file=sys.stderr)
    except Exception as e:
        print(f"Could not list installed packages: {str(e)}", file=sys.stderr)

    namespace = {}
    while True:
        try:
            # Read a line indicating the length of the incoming code
            length_line = sys.stdin.readline()
            if not length_line:
                break  # EOF

            try:
                length = int(length_line.strip())
            except ValueError:
                # Invalid length format
                error_message = "Invalid code length received."
                sys.stdout.write(f"0\n\n{len(error_message)}\n{error_message}\n")
                sys.stdout.flush()
                continue

            if length == 0:
                continue  # Skip empty commands

            # Read the code based on the specified length
            code = sys.stdin.read(length)
            # Debug: Print received code
            print(f"Received code: {code}", file=sys.stderr)

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

            # If both output and error are empty, send a confirmation message
            if not output and not error:
                output = "Code executed successfully."

            # Send back the lengths and content of output and error
            # Protocol:
            # <OUTPUT_LENGTH>\n<OUTPUT>
            # <ERROR_LENGTH>\n<ERROR>
            sys.stdout.write(f"{len(output)}\n{output}")
            sys.stdout.write(f"{len(error)}\n{error}")
            sys.stdout.flush()

        except Exception as e:
            # In case of unexpected errors in the server
            error_message = f"Server encountered an error: {str(e)}"
            sys.stdout.write(f"0\n\n{len(error_message)}\n{error_message}\n")
            sys.stdout.flush()

if __name__ == "__main__":
    main()
