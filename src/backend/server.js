process.env.NODE_PATH = __dirname + "/node_modules";
require("module").Module._initPaths();

const express = require('express');
const cors = require('cors');
const { fetchShodanData } = require("../../api/shodan.js");
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
    res.send('Threat Intelligence API is running...');
});
app.get("/shodanFetchIPData/:ip", async (req, res) => {
    const { ip } = req.params;
    const data = await fetchShodanData(ip);
    if (data) {
        res.json(data);
    } else {
        res.status(500).json({ error: "Failed to fetch data from Shodan" });
    }
});

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
      const shodanData = await fetchShodanData("8.8.8.8");

      const transformedShodanData = {
        threat_name: "Shodan Threat", 
        asset_name: "8.8.8.8",
        vulnerability_name: "Open Ports",
        likelihood: 3, 
        impact: 4, 
        risk_score: 12, 
      };

      const combinedData = [...dbData.rows, transformedShodanData];
      res.json(combinedData);
    } catch (error) {
      console.error('Error fetching threat data:', error);
      res.status(500).json({ error: 'Failed to fetch threat data' });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));