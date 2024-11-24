// src/kernelManager.js

const { spawn } = require('child_process');
const path = require('path');

// Object to store Python processes per training session
const kernels = {};

/**
 * Start a Python REPL server for a given training session.
 * @param {String} projectId
 * @param {String} trainingId
 * @param {String} projectDirPath - Absolute path to the project directory
 * @returns {ChildProcess}
 */
const startKernel = (projectId, trainingId, projectDirPath) => {
  const sessionKey = `${projectId}_${trainingId}`;

  if (kernels[sessionKey]) {
    console.warn(`Kernel for session ${sessionKey} already exists.`);
    return kernels[sessionKey];
  }

  const replScriptPath = path.join(__dirname, 'repl_server.py');

  const pythonProcess = spawn('python', [replScriptPath], {
    cwd: projectDirPath, // Set the cwd to the project directory
    stdio: ['pipe', 'pipe', 'pipe'],
  });

  pythonProcess.on('error', (err) => {
    console.error(`Error in kernel ${sessionKey}:`, err);
  });

  pythonProcess.stderr.on('data', (data) => {
    console.error(`Kernel ${sessionKey} stderr: ${data.toString()}`);
  });

  pythonProcess.stdout.on('data', (data) => {
    // Handle stdout data if needed
  });

  pythonProcess.on('close', (code) => {
    console.log(`Kernel ${sessionKey} closed with code ${code}`);
    delete kernels[sessionKey];
  });

  kernels[sessionKey] = pythonProcess;
  console.log(`Started kernel for session: ${sessionKey} in directory: ${projectDirPath}`);

  return pythonProcess;
};

/**
 * Execute code in the Python REPL server of a training session.
 * @param {String} projectId
 * @param {String} trainingId
 * @param {String} code
 * @param {String} projectDirPath - Absolute path to the project directory
 * @returns {Promise<{output: String, error: String}>}
 */
const executeCode = (projectId, trainingId, code, projectDirPath) => {
  return new Promise((resolve, reject) => {
    const sessionKey = `${projectId}_${trainingId}`;
    let kernel = kernels[sessionKey];

    if (!kernel) {
      // Start the kernel if it doesn't exist
      kernel = startKernel(projectId, trainingId, projectDirPath);
    }

    // Prepare the code to send: first send the length, then the code
    const codeBuffer = Buffer.from(code, 'utf-8');
    const lengthBuffer = Buffer.from(`${codeBuffer.length}\n`, 'utf-8');

    // Send the length and then the code
    kernel.stdin.write(lengthBuffer);
    kernel.stdin.write(codeBuffer);

    let output = '';
    let error = '';
    let state = 'reading_output_length';
    let bytesToRead = 0;

    const onData = (data) => {
      const dataStr = data.toString();
      let remaining = dataStr;

      while (remaining.length > 0) {
        if (state === 'reading_output_length') {
          const newlineIndex = remaining.indexOf('\n');
          if (newlineIndex === -1) {
            // Incomplete length
            return;
          }
          const lengthStr = remaining.slice(0, newlineIndex);
          bytesToRead = parseInt(lengthStr, 10);
          remaining = remaining.slice(newlineIndex + 1);
          state = 'reading_output';
        } else if (state === 'reading_output') {
          if (remaining.length < bytesToRead) {
            output += remaining;
            bytesToRead -= remaining.length;
            remaining = '';
            return;
          }
          output += remaining.slice(0, bytesToRead);
          remaining = remaining.slice(bytesToRead);
          state = 'reading_error_length';
        } else if (state === 'reading_error_length') {
          const newlineIndex = remaining.indexOf('\n');
          if (newlineIndex === -1) {
            // Incomplete length
            return;
          }
          const lengthStr = remaining.slice(0, newlineIndex);
          bytesToRead = parseInt(lengthStr, 10);
          remaining = remaining.slice(newlineIndex + 1);
          state = 'reading_error';
        } else if (state === 'reading_error') {
          if (remaining.length < bytesToRead) {
            error += remaining;
            bytesToRead -= remaining.length;
            remaining = '';
            return;
          }
          error += remaining.slice(0, bytesToRead);
          remaining = remaining.slice(bytesToRead);
          state = 'done';
          // Cleanup: remove listener after receiving complete response
          kernel.stdout.removeListener('data', onData);
          resolve({ output: output.trim(), error: error.trim() });
          return;
        }
      }
    };

    kernel.stdout.on('data', onData);

    // Handle process exit
    kernel.on('close', (code) => {
      if (code !== 0) {
        console.error(`Kernel process exited with code ${code}`);
        reject(new Error(`Kernel process exited with code ${code}`));
      }
    });

    // Implement a timeout to prevent hanging
    const timeout = setTimeout(() => {
      kernel.stdout.removeListener('data', onData);
      reject(new Error('Execution timed out.'));
    }, 10000); // 10 seconds

    // Clear the timeout upon resolution or rejection
    const originalResolve = resolve;
    resolve = (value) => {
      clearTimeout(timeout);
      originalResolve(value);
    };

    const originalReject = reject;
    reject = (error) => {
      clearTimeout(timeout);
      originalReject(error);
    };
  });
};

/**
 * Stop the Python REPL server for a given training session.
 * @param {String} projectId
 * @param {String} trainingId
 */
const stopKernel = (projectId, trainingId) => {
  const sessionKey = `${projectId}_${trainingId}`;
  const kernel = kernels[sessionKey];

  if (kernel) {
    // Gracefully terminate the Python process
    kernel.stdin.end(); // Send EOF
    kernel.kill();
    delete kernels[sessionKey];
    console.log(`Stopped kernel for session: ${sessionKey}`);
  } else {
    console.warn(`No kernel found for session: ${sessionKey}`);
  }
};

module.exports = {
  startKernel,
  executeCode,
  stopKernel,
};
