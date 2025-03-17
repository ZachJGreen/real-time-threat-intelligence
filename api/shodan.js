const axios = require("axios");
const { shodanApiKey } = require("../src/backend/config");

async function fetchShodanData(ip) {
    const url = `https://api.shodan.io/shodan/host/${ip}?key=${shodanApiKey}`;

    try {
        const response = await axios.get(url);
        console.log(`Shodan Data for ${ip}:`, response.data);


        const transformedData = {
            threat_name: "Shodan Threat", 
            asset_name: ip, 
            vulnerability_name: "Open Ports", 
            likelihood: 3, 
            impact: 4, 
            risk_score: 12, 
        };
    } catch (error) {
        console.error("Error fetching from Shodan:", error.response?.data || error.message);
        return null;
    }
}

module.exports = { fetchShodanData };