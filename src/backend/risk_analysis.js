// /src/backend/risk_analysis.js
require('dotenv').config({ path: '../../.env'});
const axios = require('axios');

/**
 * Sleep for a specified number of milliseconds
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise} - Resolves after specified time
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Analyze cybersecurity risk using Hugging Face's inference API
 * @param {string} threat - The name of the threat
 * @param {number} likelihood - Likelihood score (1–5)
 * @param {number} impact - Impact score (1–5)
 * @param {string} model - Hugging Face model ID (default: 'HuggingFaceH4/zephyr-7b-beta')
 * @returns {Promise<Object>} - Risk assessment with score and explanation
 */
async function analyzeRisk(threat, likelihood, impact, model = 'HuggingFaceH4/zephyr-7b-beta') {
    // Input validation
    if (!threat || typeof threat !== 'string') {
        throw new Error('Threat must be a non-empty string');
    }

    if (!Number.isInteger(likelihood) || likelihood < 1 || likelihood > 5) {
        throw new Error('Likelihood must be an integer between 1 and 5');
    }

    if (!Number.isInteger(impact) || impact < 1 || impact > 5) {
        throw new Error('Impact must be an integer between 1 and 5');
    }

    // Calculate the raw risk score
    const rawScore = likelihood * impact;

    try {
        // Use the Hugging Face Inference API with axios
        const HF_API_KEY = process.env.HF_API_KEY || ''; // Hugging Face API key from .env
        const API_URL = `https://api-inference.huggingface.co/models/${model}`;

        const prompt = `<s>[INST] 
You are a cybersecurity risk analyst. 

Based on best practices, assess the risk of the following threat:

- Threat: ${threat}
- Likelihood: ${likelihood} (1 = Low, 5 = High)
- Impact: ${impact} (1 = Low, 5 = High)

Calculate the risk score using:  
**Risk Score = Likelihood × Impact** (Max = 25)

Then respond with:
1. Final Risk Score
2. Risk Level (e.g., Low, Medium, High, Critical)
3. Short explanation of the threat's impact
4. Recommended mitigation actions

Be concise and use bullet points if helpful.
[/INST]</s>
`;

        const response = await axios.post(API_URL,
            {
                inputs: prompt,
                parameters: {
                    max_new_tokens: 300,
                    temperature: 0.3,
                    return_full_text: false
                }
            },
            {
                headers: {
                    'Authorization': `Bearer ${HF_API_KEY}`,
                    'Content-Type': 'application/json',
                }
            }
        );

        // Extract the generated text from the response
        const result = response.data;
        let analysisText = '';

        if (Array.isArray(result) && result.length > 0) {
            analysisText = result[0].generated_text;
        } else if (result.generated_text) {
            analysisText = result.generated_text;
        } else {
            // Handle other response formats
            analysisText = JSON.stringify(result);
        }

        // Clean up the text
        analysisText = cleanAnalysisText(analysisText);

        // Determine risk level based on score
        let riskLevel;
        if (rawScore <= 5) riskLevel = "Low";
        else if (rawScore <= 12) riskLevel = "Medium";
        else if (rawScore <= 19) riskLevel = "High";
        else riskLevel = "Critical";

        return {
            threat,
            likelihood,
            impact,
            rawScore,
            riskLevel,
            analysisText,
            modelUsed: model
        };
    } catch (error) {
        console.error("Error during risk analysis:", error);

        // Handle model loading errors (common with free tier)
        if (error.response && error.response.status === 503) {
            console.warn("Model is loading. Retrying in 5 seconds...");
            await sleep(5000);
            return analyzeRisk(threat, likelihood, impact, model);
        }

        // Provide a basic fallback assessment if the API call fails
        let riskLevel;
        if (rawScore <= 5) riskLevel = "Low";
        else if (rawScore <= 12) riskLevel = "Medium";
        else if (rawScore <= 19) riskLevel = "High";
        else riskLevel = "Critical";

        return {
            threat,
            likelihood,
            impact,
            rawScore,
            riskLevel,
            analysisText: `${riskLevel} risk (${rawScore}/25). Failed to get detailed analysis.`,
            modelUsed: "fallback",
            error: true
        };
    }
}

/**
 * Clean up the analysis text from Hugging Face
 * @param {string} text - Raw text from the model
 * @returns {string} - Cleaned text
 */
function cleanAnalysisText(text) {
    if (!text) return '';

    // Remove leading 'm' if it exists (common issue with some models)
    if (text.startsWith('m ')) {
        text = text.substring(2);
    }

    // Convert newline characters to actual line breaks
    text = text.replace(/\\n/g, '\n');

    // Remove any excessive whitespace
    text = text.replace(/\s+/g, ' ').trim();

    // Extract just the explanation part (skip the calculation part)
    const parts = text.split('Risk score =');
    if (parts.length > 1) {
        // Find where the explanation starts after the calculations
        const match = parts[parts.length - 1].match(/\d+\s*(.*)/);
        if (match && match[1]) {
            text = match[1].trim();
        }
    }

    return text;
}

/**
 * Format the risk analysis results into a clean, readable format
 * @param {Object} result - Risk analysis result
 * @returns {string} - Formatted output
 */
function formatRiskAnalysis(result) {
    if (!result) return 'No analysis available';

    return `
THREAT: ${result.threat}
RISK LEVEL: ${result.riskLevel} (${result.rawScore}/25)
LIKELIHOOD: ${result.likelihood}/5 
IMPACT: ${result.impact}/5

ANALYSIS:
${result.analysisText}
`;
}

/**
 * Batch process multiple risk analyses with rate limiting
 * @param {Array<Object>} analyses - Array of {threat, likelihood, impact} objects
 * @param {string} model - Hugging Face model ID
 * @returns {Promise<Array>} - Results of all analyses
 */
async function batchAnalyzeRisks(analyses, model = 'HuggingFaceH4/zephyr-7b-beta') {
    const results = [];

    // Process one at a time with delay between requests
    for (const analysis of analyses) {
        try {
            const result = await analyzeRisk(
                analysis.threat,
                analysis.likelihood,
                analysis.impact,
                model
            );
            results.push(result);

            // Add delay between requests
            await sleep(2000);
        } catch (error) {
            results.push({
                threat: analysis.threat,
                error: error.message,
                failed: true
            });
        }
    }

    return results;
}

module.exports = { analyzeRisk, batchAnalyzeRisks, formatRiskAnalysis };

// Test if run directly
if (require.main === module) {
    // Usage examples
    console.log("Running test with Hugging Face model...");

    analyzeRisk("SQL Injection", 4, 5)
        .then(result => {
            console.log(formatRiskAnalysis(result));
        })
        .catch(err => console.error(err.message));

    // Uncomment to test batch analysis

    batchAnalyzeRisks([
        { threat: "SQL Injection", likelihood: 4, impact: 5 },
        { threat: "Phishing Attack", likelihood: 5, impact: 4 },
        { threat: "Unpatched Software", likelihood: 3, impact: 4 }
    ]).then(results => {
        results.forEach(result => {
            console.log(formatRiskAnalysis(result));
            console.log("-----------------------------------");
        });
    });

}