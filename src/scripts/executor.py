# scripts/executor.py

import sys
import traceback
import io
import contextlib

def main():
    global_vars = {}
    buffer = []
    print("Executor started and waiting for code...")
    sys.stdout.flush()
    while True:
        line = sys.stdin.readline()
        if not line:
            print("Executor received EOF. Exiting.")
            sys.stdout.flush()
            break  # EOF
        if line.strip() == 'END_OF_CODE':
            code = '\n'.join(buffer)
            buffer = []
            # Use StringIO to capture stdout and stderr
            stdout_capture = io.StringIO()
            stderr_capture = io.StringIO()
            try:
                with contextlib.redirect_stdout(stdout_capture):
                    with contextlib.redirect_stderr(stderr_capture):
                        exec(code, global_vars)
                stdout_content = stdout_capture.getvalue()
                stderr_content = stderr_capture.getvalue()
                if stderr_content:
                    print(stderr_content)
                elif stdout_content:
                    print(stdout_content)
                else:
                    print('Execution Successful')
                print('OUTPUT_END')
            except Exception:
                traceback.print_exc()
                print('OUTPUT_END')
            sys.stdout.flush()
        else:
            buffer.append(line.rstrip('\n'))

if __name__ == '__main__':
    main()
