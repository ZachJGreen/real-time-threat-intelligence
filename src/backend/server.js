// Ensure Node.js looks for modules in the backend folder
process.env.NODE_PATH = __dirname + "/node_modules";
require("module").Module._initPaths();

const express = require('express');
const cors = require('cors');
const { fetchShodanData } = require("../../api/fetch_osint");
const { Pool } = require('pg');


require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
    user: 'your_db_user',
    host: 'localhost',
    database: 'your_db_name',
    password: 'your_db_password',
    port: 5432,
});

app.get('/', (req, res) => {
    res.send('Welcome to the Real-Time Threat Intelligence API!');
});

app.post("/api/fetchShodanThreatData", async (req, res) => {
    const { ip } = req.body;  // Use req.body to access the IP

    if (!ip) {
        return res.status(400).json({ message: "IP address is required" });
    }


    try {
        await fetchAndStoreShodanData(ip);  // Call the function to fetch and store data
        res.json({ message: "Shodan threat data fetched and stored successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error fetching or storing Shodan data", error: error.message });

app.get("/getThreatData", async (req, res) => {
    try {
      const query = `
        SELECT t.threat_name, a.asset_name, v.vulnerability_name, tm.likelihood, tm.impact, tm.risk_score
        FROM tva_mapping tm
        JOIN threats t ON tm.threat_id = t.id
        JOIN assets a ON tm.asset_id = a.id
        JOIN vulnerabilities v ON tm.vulnerability_id = v.id
      `;
      const dbData = await pool.query(query);
      let shodanData;
      try {
        shodanData = await fetchShodanData("8.8.8.8");
      } catch (shodanError) {
        console.error('Error fetching Shodan data:', shodanError);
        shodanData = null;
      } 

      const transformedShodanData = shodanData ? {
        threat_name: "Shodan Threat", 
        asset_name: "8.8.8.8",
        vulnerability_name: "Open Ports",
        likelihood: 3, 
        impact: 4, 
        risk_score: 12, 
      } : null;

      const combinedData = transformedShodanData ? [...dbData.rows, transformedShodanData] : dbData.rows;
      res.json(combinedData);
    } catch (error) {
      console.error('Error fetching threat data:', error);
      res.status(500).json({ error: 'Failed to fetch threat data' });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
