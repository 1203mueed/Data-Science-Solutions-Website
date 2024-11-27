// src/services/geminiService.js

// Ensure proper imports
const { GoogleGenerativeAI } = require('@google/generative-ai');
const path = require('path');
require('dotenv').config(); // Load environment variables

/**
 * Initializes and returns the Gemini AI model.
 * @returns {GenerativeModel} - An instance of the Gemini AI generative model.
 */
function initializeGemini() {
  // Initialize the GoogleGenerativeAI instance with your API key from environment variables
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'api');

  // Get the generative model
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

  return model;
}

/**
 * Sends a single code snippet to Gemini AI for approval with full notebook context.
 * @param {Array} allCells - Array of all code cells in the notebook.
 * @param {Object} targetCell - The specific cell object to be evaluated.
 * @param {Array} datasetFolders - Array of dataset folder names uploaded by data providers.
 * @returns {Promise<{ approved: boolean, reason: string }>} - Approval result.
 */
async function approveSingleCell(allCells, targetCell, datasetFolders) {
  const model = initializeGemini();

  // Prepare the dataset folders information
  let datasetInfo = '';
  if (Array.isArray(datasetFolders) && datasetFolders.length > 0) {
    datasetInfo = `I've created a federated training platform where data providers will provide data, and using that data, the model trainer will be able to train the model without breaching privacy. You are assigned as a code checker. I'm providing you all the codes of the model trainer and you should respond with "Approved" or "Rejected: <reason>" for the specified cell. Only provide one of these two responses for the specified cell. Do not provide approvals or rejections for other cells. Here are the data providers' folders: ${datasetFolders.join(', ')}.`;
    
    datasetInfo += `

**Examples:**

1. **Allowed:**
   - Reading a CSV file from any location:
     \`\`\`python
     import pandas as pd
     df = pd.read_csv('newfeatures(in).csv')
     \`\`\`

2. **Disallowed:**
   - Saving data from dataset folders:
     \`\`\`python
     df.to_csv('dataset-prefix/output.csv')
     \`\`\`
`;
  } else {
    datasetInfo = `I've created a federated training platform where data providers will provide data, and using that data, the model trainer will be able to train the model without breaching privacy. You are assigned as a code checker. I'm providing you all the codes of the model trainer and you should respond with "Approved" or "Rejected: <reason>" for the specified cell. Only provide one of these two responses for the specified cell. Do not provide approvals or rejections for other cells. Here are the data providers' folders: None.

**Examples:**

1. **Allowed:**
   - Reading a CSV file:
     \`\`\`python
     import pandas as pd
     df = pd.read_csv('any_file.csv')
     \`\`\`
`;
  }

  // Define the prompt based on the presence of dataset folders
  const prompt = `${datasetInfo}

**Important:** Only evaluate the code for the specified cell below without making any assumptions or inferences about additional code that may or may not exist.

You act as a code checker and determine if the model trainer's code in the specified cell adheres to these privacy constraints. Please review the following code and respond with "Approved" or "Rejected: <reason>". Only provide one of these two responses.

**Notebook Context:**
${allCells
    .map((cell, index) => `**Cell ${index + 1}: ${cell.cellId}**

\`\`\`python
${cell.code}
\`\`\``)
    .join('\n\n')}

**Target Cell: ${targetCell.cellId}**
\`\`\`python
${targetCell.code}
\`\`\``;

/*
Example Desired AI Response:
Approved
OR
Rejected: Reason for rejection.
*/

try {
  // Print the prompt for debugging purposes
  console.log('Prompt sent to Gemini AI:\n', prompt);

  // Generate content using Gemini AI
  const result = await model.generateContent(prompt);
  const responseText = await result.response.text(); // Ensure we await the text

  console.log('Gemini AI Response:', responseText); // For debugging

  const lowerCaseResponse = responseText.trim().toLowerCase();

  if (lowerCaseResponse.startsWith('approved')) {
    return { approved: true, reason: '' };
  } else if (lowerCaseResponse.startsWith('rejected')) {
    const reasonMatch = responseText.match(/rejected:\s*(.*)/i);
    const reason = reasonMatch ? reasonMatch[1].trim() : 'No reason provided.';
    return { approved: false, reason };
  } else {
    // Handle unexpected responses
    console.warn('Unexpected Gemini AI response format.');
    return { approved: false, reason: 'Invalid response format from Gemini AI.' };
  }
} catch (error) {
  console.error('Error interacting with Gemini AI:', error);
  throw new Error('Failed to approve code with Gemini AI.');
}
}
module.exports = { approveSingleCell };
