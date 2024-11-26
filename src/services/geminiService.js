// src/services/geminiService.js

const { GoogleGenerativeAI } = require('@google/generative-ai');

/**
 * Initializes and returns the Gemini AI model.
 * @returns {GenerativeModel} - An instance of the Gemini AI generative model.
 */
function initializeGemini() {
  // Initialize the GoogleGenerativeAI instance with your API key from environment variables
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

  // Get the generative model
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  return model;
}

/**
 * Approves code using Gemini AI.
 * Sends all code cells' code to Gemini for approval.
 * @param {Array} cells - Array of cell objects containing code.
 * @returns {Promise<{ approved: boolean, reason: string }>} - Approval result.
 */
async function approveCode(cells) {
  const model = initializeGemini();

  // Aggregate all code from code cells
  const aggregatedCode = cells
    .filter((cell) => cell.type === 'code' && cell.code.trim() !== '')
    .map((cell) => cell.code)
    .join('\n\n');

  if (!aggregatedCode) {
    return { approved: false, reason: 'No valid code found to review.' };
  }

  // Define the prompt
  const prompt = `I've built a federated training platform where data providers will provide data and using that data, a model provider will provide a model. You act as a code checker and determine if the model trainer's code breaches the privacy of the data providers' data. Please review the following code and respond with "Approved" or "Rejected: <reason>".\n\nCode:\n\`\`\`${aggregatedCode}\n\`\`\``;

  try {
    // Generate content using Gemini AI
    const result = await model.generateContent(prompt);
    const responseText = await result.response.text(); // Ensure we await the text

    console.log('Gemini AI Response:', responseText); // For debugging

    const lowerCaseResponse = responseText.trim().toLowerCase();

    if (lowerCaseResponse.startsWith('approved')) {
      return { approved: true, reason: '' };
    } else if (lowerCaseResponse.startsWith('rejected')) {
      const reasonMatch = responseText.match(/Rejected:\s*(.*)/i);
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

module.exports = { approveCode };
