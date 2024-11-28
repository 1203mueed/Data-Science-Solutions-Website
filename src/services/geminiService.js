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
    datasetInfo = `I've created a federated training platform where data providers will provide data, and using that data, the model trainer will be able to train the model without breaching privacy. You are assigned as a code checker. I'm providing you all the codes of the model trainer and you should respond with "Approved" or "Rejected: <reason>" for the specified cell. Only provide one of these two responses for the specified cell. Do not provide approvals or rejections for other cells. Here are the data providers' folders: ${datasetFolders.join(', ')}.` +
      `

**Examples:** 

1. **Allowed:**
   - Reading a CSV file from any location outside the dataset folders:
     \`\`\`python
     import pandas as pd
     df = pd.read_csv('newfeatures(in).csv')
     \`\`\`

   - Reading a CSV file from a dataset folder:
     \`\`\`python
     import pandas as pd
     df = pd.read_csv('dataset-prefix/testing_dataset_1/derm12345_metadata_train.csv')
     \`\`\`

   - Storing or processing data read from dataset folders:
     \`\`\`python
     summary = df.describe()
     print(summary)
     \`\`\`

2. **Disallowed:**
   - Visualizing data directly read from dataset folders:
     \`\`\`python
     import matplotlib.pyplot as plt
     import pandas as pd
     df = pd.read_csv('dataset-prefix/testing_dataset_1/derm12345_metadata_train.csv')
     plt.plot(df['column'])
     plt.show()
     \`\`\`

   - Saving modified data back to dataset folders:
     \`\`\`python
     df.to_csv('dataset-prefix/output.csv')
     \`\`\`

   - Deleting files from dataset folders:
     \`\`\`python
     os.remove('dataset-prefix/testing_dataset_1/derm12345_metadata_train.csv')
     \`\`\`
`;
  } else {
    datasetInfo = `I've created a federated training platform where data providers will provide data, and using that data, the model trainer will be able to train the model without breaching privacy. You are assigned as a code checker. I'm providing you all the codes of the model trainer and you should respond with "Approved" or "Rejected: <reason>" for the specified cell. Only provide one of these two responses for the specified cell. Do not provide approvals or rejections for other cells. Here are the data providers' folders: None.
    `;
  }

  // Define the prompt based on the presence of dataset folders
  const prompt = `${datasetInfo}

**Important Rules:**
1. The model trainer can freely read data from files **outside dataset folders** without restriction.
2. For files inside dataset folders, the model trainer can:
   - Read files and store the data into variables.
   - Perform processing or analysis on data stored in variables.

3. **Disallowed Actions for Dataset Folders:**
   - Saving modified data back to the dataset folders.
   - Visualizing data directly read from dataset folders.
   - Performing any action that breaches data privacy or integrity.

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
\`\`\`

**Evaluation Instructions:**
You are tasked with evaluating whether the target cell adheres to the rules specified above. Respond with:
- "Approved" if the cell complies with all rules.
- "Rejected: <reason>" if the cell violates any rules.

Examples of valid responses:
1. Approved
2. Rejected: Saving data back to dataset folders is not allowed.`;

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
