// Ensure Node.js looks for modules in the backend folder
process.env.NODE_PATH = __dirname + "/node_modules";
require("module").Module._initPaths();

const express = require('express');
const cors = require("cors");
const { fetchShodanData } = require("../../api/fetch_osint");
const { Pool } = require('pg');

require('dotenv').config();

const app = express();
app.use(cors({ origin: "*" })); // Allow all origins (for debugging)
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
      // Assuming fetchAndStoreShodanData is a function that fetches and stores data
      await fetchAndStoreShodanData(ip);  // Call the function to fetch and store data
      res.json({ message: "Shodan threat data fetched and stored successfully" });
  } catch (error) {
      res.status(500).json({ message: "Error fetching or storing Shodan data", error: error.message });
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
      
      let shodanData = null;
      try {
          // Make sure fetchShodanData is working correctly
          shodanData = await fetchShodanData("8.8.8.8");
      } catch (shodanError) {
          console.error('Error fetching Shodan data:', shodanError);
          shodanData = null; // Handle error gracefully by setting shodanData to null
      }

      // Transform the Shodan data if it's available, or skip
      const transformedShodanData = shodanData ? {
          threat_name: "Shodan Threat", 
          asset_name: "8.8.8.8",
          vulnerability_name: "Open Ports",
          likelihood: 3, 
          impact: 4, 
          risk_score: 12, 
      } : null;

      // Combine database threat data with Shodan data if available
      const combinedData = transformedShodanData ? [...dbData.rows, transformedShodanData] : dbData.rows;
      
      res.json(combinedData);  // Send the combined data as a response
  } catch (error) {
      console.error('Error fetching threat data:', error);
      res.status(500).json({ error: 'Failed to fetch threat data' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(3000, () => console.log("Server running on port 3000"));
