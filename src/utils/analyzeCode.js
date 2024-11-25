// src/utils/analyzeCode.js

const { Configuration, OpenAIApi } = require('openai');

// Initialize OpenAI API with your API key from environment variables
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY, // Ensure your API key is set in the .env file
});
const openai = new OpenAIApi(configuration);

/**
 * Analyze code cells for potential privacy breaches.
 * @param {Array} approvedCells - Previously approved code cells.
 * @param {String} currentCellCode - Code of the cell being approved.
 * @returns {Promise<String>} - Analysis result from OpenAI.
 */
const analyzeCode = async (approvedCells, currentCellCode) => {
  // Craft the prompt
  let prompt = `
You are a code auditor for a federated learning platform. Your task is to analyze Python code cells for potential privacy breaches, considering the following policies:

Allowed actions for the model trainer:
- Plotting training metrics (e.g., loss functions) using aggregated data.
- Saving the trained model (e.g., in '.pt' format).
- Importing necessary libraries for model training and evaluation.

Disallowed actions:
- Accessing, displaying, or saving raw data provided by data providers.
- Printing or saving individual data samples.
- Visualizing raw data samples (e.g., images from datasets).
- Exporting data to external files or sending it over the network.
- Any code that could potentially breach data privacy.

The following code cells were previously approved:
`;

  // Limit the number of approved cells to include in the prompt to avoid token limits
  const MAX_APPROVED_CELLS = 10; // Adjust as needed
  const recentApprovedCells = approvedCells.slice(-MAX_APPROVED_CELLS);

  recentApprovedCells.forEach((approvedCell, index) => {
    prompt += `
[Code Cell ${index + 1}]
\`\`\`python
${approvedCell.code}
\`\`\`
`;
  });

  prompt += `
Please focus on analyzing the following new code cell, which is pending approval:

[Code Cell ${recentApprovedCells.length + 1}]
\`\`\`python
${currentCellCode}
\`\`\`

Please analyze this new cell to determine if it complies with the privacy policies. If it violates any policies, identify the specific code and explain why it is disallowed. If it complies, confirm that it does not breach data privacy.
`;

  try {
    // Send the prompt to OpenAI API
    const response = await openai.createChatCompletion({
      model: 'gpt-4', // Use 'gpt-3.5-turbo' if you don't have access to GPT-4
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: prompt },
      ],
      max_tokens: 500,
      temperature: 0,
    });

    const analysis = response.data.choices[0].message.content.trim();
    return analysis;
  } catch (error) {
    console.error('Error during OpenAI API call:', error.message);
    throw new Error('Error analyzing code.');
  }
};

module.exports = { analyzeCode };
