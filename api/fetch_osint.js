const { client } = require("../src/backend/pg"); // Database connection
const { fetchShodanData } = require("./shodan");

/**
 * Fetches threat intelligence data from Shodan and stores it in the database
 * @param {string} ip - The IP address to analyze
 */
async function fetchAndStoreShodanData(ip) {
    try {
        console.log(`Fetching Shodan data for IP: ${ip}`);

        // Fetch threat data from Shodan
        const shodanData = await fetchShodanData(ip);

        if (!shodanData || !shodanData.ports) {
            console.error("No relevant threat data found from Shodan.");
            return;
        }

        // Define asset ID dynamically (replace with the actual ID)
        const assetId = 1; 

        // Store Shodan threat data
        const threatName = `Open Ports: ${shodanData.ports.join(", ")}`;
        const vulnerabilityDescription = "Exposed services detected";
        const likelihood = 4; // Example value
        const impact = 5; // Example value

        const query = `
            INSERT INTO tva_mapping (asset_id, threat_id, vulnerability_id, likelihood, impact)
            VALUES ($1, (SELECT id FROM threats WHERE threat_name = $2 LIMIT 1), 
            (SELECT id FROM vulnerabilities WHERE vulnerability_name = $3 LIMIT 1), $4, $5)
            RETURNING *;
        `;

        const values = [assetId, threatName, vulnerabilityDescription, likelihood, impact];
        const result = await client.query(query, values);
        console.log("Shodan threat data stored:", result.rows[0]);
    } catch (error) {
        console.error("Error storing Shodan threat data:", error.message);
    }
}

// Example test run
fetchAndStoreShodanData("8.8.8.8");

module.exports = { fetchAndStoreShodanData };

