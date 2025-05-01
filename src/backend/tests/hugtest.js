require('dotenv').config();
const axios = require('axios');

async function testThreatPrediction() {
    try {
        const prompt = "SQL Injection detected on login page.";
        const response = await axios.post('http://localhost:8000/predict', {
            prompt: prompt
        }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        console.log("AI Threat Prediction:");
        console.log(response.data.output); // just print the generated output

    } catch (error) {
        if (error.response) {
            console.error("API Error:", error.response.status, error.response.data);
        } else {
            console.error("Connection Error:", error.message);
        }
    }
}

testThreatPrediction();
