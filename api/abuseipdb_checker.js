require('dotenv').config({ path: '../src/backend/.env' });
const axios = require('axios');

const ABUSEIPDB_API_KEY = process.env.ABUSEIPDB_API_KEY || "";

const ABUSEIPDB_URL = "https://api.abuseipdb.com/api/v2/check";

/**
 * Check an IP address reputation using AbuseIPDB
 * @param {string} ip - IP address to check
 * @returns {Promise<object>} - AbuseIPDB report or error info
 */
async function checkAbuseIP(ip) {
    try {
        const response = await axios.get(ABUSEIPDB_URL, {
            headers: {
                Key: ABUSEIPDB_API_KEY,
                Accept: 'application/json'
            },
            params: {
                ipAddress: ip,
                maxAgeInDays: 90 // Check reports in the last 90 days
            }
        });

        return response.data.data; // Return the useful part only

    } catch (error) {
        console.error("Error fetching AbuseIPDB data:", error.response?.status, error.response?.data || error.message)
        return null;
    }
}

// Example
if (require.main === module) {
    checkAbuseIP("8.8.8.8")
        .then(data => console.log("AbuseIPDB Report:", data))
        .catch(err => console.error("Error:", err));
}

module.exports = { checkAbuseIP };
