require('dotenv').config({ path: '../src/backend/.env' });
const axios = require('axios');

const API_KEY = process.env.SECURITYTRAILS_API_KEY;
const BASE_URL = "https://api.securitytrails.com/v1/domain";

/**
 * Fetch domain information using SecurityTrails
 * @param {string} domain - The domain to query (e.g., "example.com")
 * @returns {Promise<object|null>} - Domain info or null on error
 */
async function lookupDomain(domain) {
    try {
        const response = await axios.get(`${BASE_URL}/${domain}`, {
            headers: {
                APIKEY: API_KEY
            }
        });

        return response.data;
    } catch (error) {
        console.error("❌ SecurityTrails error:", error.response?.status, error.response?.data || error.message);
        return null;
    }
}

// Direct test
if (require.main === module) {
    lookupDomain("example.com")
        .then(data => console.log("SecurityTrails Data:", data))
        .catch(err => console.error("Error:", err));
}

module.exports = { lookupDomain };
