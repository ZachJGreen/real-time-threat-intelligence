//This file is run by running a python file to create a local AI (huggingface/model/gpt2)
//using the transformer library.
//This is to circumvent the paid service we would need to use the AI api,
//and it needs to be running on the serverURL in terminal to work.
//see the README for instructions to set up.

require('dotenv').config();
const axios = require('axios');

// can move into .env, but fine for rn
const AI_SERVER_URL = process.env.AI_SERVER_URL || "http://localhost:8000/predict";

/**
 * Predict next attack behavior based on a threat description
 * @param {string} threatDescription - A short text describing the threat
 * @returns {Promise<string>} - AI-generated predicted next steps
 * this is a super basic AI and not very powerful/useful but since we would need to pay for it this is more of a proof of concept
 */
async function predictThreatBehavior(threatDescription) {
    try {
        const response = await axios.post(AI_SERVER_URL, {
            prompt: threatDescription
        }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        // Return the AI-generated text
        return response.data.output || "No prediction generated.";

    } catch (error) {
        console.error("❌ Error contacting AI service:", error.response?.status, error.response?.data || error.message);
        return "Error generating prediction.";
    }
}

// Example direct usage (for testing)
/*
if (require.main === module) {
    predictThreatBehavior("SQL Injection detected on login page.")
        .then(prediction => console.log("Predicted Next Steps:", prediction))
        .catch(err => console.error("Error:", err));
}
*/

module.exports = { predictThreatBehavior };
