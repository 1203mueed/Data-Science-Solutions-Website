// src/utils/codeAnalyzer.js

const disallowedPatterns = [
    /os\.system/, // Disallow 'os.system'
    /subprocess\.call/, // Disallow 'subprocess.call'
    /subprocess\.Popen/, // Disallow 'subprocess.Popen'
    /plt\./, // Disallow use of 'matplotlib.pyplot' (plt)
    /requests\./, // Disallow 'requests' library usage
    /urllib\.request/, // Disallow 'urllib.request' usage
    /socket\./, // Disallow 'socket' module usage
    /\bimport\s+os\b/, // Disallow importing 'os' module
    /\bimport\s+sys\b/, // Disallow importing 'sys' module
    /\bimport\s+subprocess\b/, // Disallow importing 'subprocess'
    /\bimport\s+socket\b/, // Disallow importing 'socket' module
    /\bimport\s+webbrowser\b/, // Disallow importing 'webbrowser'
    /webbrowser\./, // Disallow 'webbrowser' module usage
    /\bimport\s+requests\b/, // Disallow importing 'requests' library
    /\bimport\s+urllib\b/, // Disallow importing 'urllib' library
    /json\.dump/, // Disallow writing to JSON files
    /pd\.to_csv/, // Disallow exporting data using pandas
    /pd\.head/, // Disallow displaying data using pandas
    // Add more patterns as needed
  ];
  
  /**
   * Analyze code cells for potential privacy breaches.
   * @param {String} code - Code of the cell being approved.
   * @returns {String|null} - Returns null if code is approved, or a string with the rejection reason.
   */
  const analyzeCode = (code) => {
    for (const pattern of disallowedPatterns) {
      if (pattern.test(code)) {
        return `Code contains disallowed pattern: ${pattern}`;
      }
    }
    return null; // Code is approved
  };
  
  module.exports = { analyzeCode };
  