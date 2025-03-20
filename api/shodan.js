/*
const axios = require("axios");
const pool = require('./db');
const { shodanApiKey } = require("../src/backend/config");

async function fetchShodanData(ip) {
    const url = `https://api.shodan.io/shodan/host/${ip}?key=${shodanApiKey}`;

    try {
        const response = await axios.get(url);
        console.log(`Shodan Data for ${ip}:`, response.data);
        return response.data;
    } catch (error) {
        console.error("Error fetching from Shodan:", error.response?.data || error.message);
        return null;
    }
}

module.exports = { fetchShodanData };
 */
// Function to store threat data into the database
const axios = require('axios');
const { client } = require('../src/backend/pg'); // Use pg.js instead of db.js
require('dotenv').config();
const SHODAN_API_KEY = process.env.SHODAN_API_KEY;

// Function to fetch threat data from Shodan
async function fetchShodanData(ip) {
    const url = `https://api.shodan.io/shodan/host/${ip}?key=${SHODAN_API_KEY}`;

    try {
        const response = await axios.get(url);
        const data = response.data;

        console.log(`Shodan Data for ${ip}:`, data);

        // Extract key information
        const openPorts = data.ports || [];
        const hostnames = data.hostnames || [];
        const vulnerabilities = data.vulns ? Object.keys(data.vulns) : [];
        const cpes = data.cpes || [];

        // Handle case where no open ports are found
        if (openPorts.length === 0) {
            console.log(`No open ports detected for ${ip}.`);
            return;
        }

        // Prepare threat data object
        const threatData = {
            asset_id: 1, // Adjust dynamically if needed
            ip_address: ip,
            hostnames: hostnames.length > 0 ? hostnames.join(", ") : "N/A",
            threat_name: "Exposed Ports & Potential Vulnerabilities",
            vulnerability_description: `Open ports detected: ${openPorts.join(", ")}${vulnerabilities.length > 0 ? `. Vulnerabilities: ${vulnerabilities.join(", ")}` : ""}${cpes.length > 0 ? `. CPEs: ${cpes.join(", ")}` : ""}`,
            likelihood: 4, // Example risk level
            impact: vulnerabilities.length > 0 ? 5 : 3 // Higher impact if vulnerabilities exist
        };

        console.log("Threat Data:", threatData);

        // Store data in the database
        await storeThreatData(threatData);
    } catch (error) {
        console.error("Error fetching from Shodan:", error.response?.data || error.message);
    }
}

// Function to store threat data into the database
async function storeThreatData({ asset_id, threat_name, vulnerability_description, likelihood, impact }) {
    try {
        await client.query("BEGIN");

        // Insert or update threats
        const threatRes = await client.query(
            `INSERT INTO threats (asset_id, threat_name) 
             VALUES ($1, $2) 
             ON CONFLICT (asset_id, threat_name) 
             DO UPDATE SET threat_name=EXCLUDED.threat_name 
             RETURNING id`,
            [asset_id, threat_name]
        );
        const threat_id = threatRes.rows[0].id;

        // Insert or update vulnerabilities
        const vulnRes = await client.query(
            `INSERT INTO vulnerabilities (asset_id, vulnerability_name) 
             VALUES ($1, $2) 
             ON CONFLICT (asset_id, vulnerability_name) 
             DO UPDATE SET vulnerability_name=EXCLUDED.vulnerability_name 
             RETURNING id`,
            [asset_id, vulnerability_description]
        );
        const vulnerability_id = vulnRes.rows[0].id;

        // Insert or update mapping table
        await client.query(
            `INSERT INTO tva_mapping (asset_id, threat_id, vulnerability_id, likelihood, impact)
             VALUES ($1, $2, $3, $4, $5)
             ON CONFLICT (asset_id, threat_id, vulnerability_id) 
             DO UPDATE SET likelihood=EXCLUDED.likelihood, impact=EXCLUDED.impact`,
            [asset_id, threat_id, vulnerability_id, likelihood, impact]
        );

        await client.query("COMMIT");
        console.log(`Stored threat: ${threat_name} with risk score: ${likelihood * impact}`);
    } catch (error) {
        await client.query("ROLLBACK");
        console.error("Database insert error:", error.message);
    }
}

// Export functions
module.exports = { fetchShodanData, storeThreatData };
