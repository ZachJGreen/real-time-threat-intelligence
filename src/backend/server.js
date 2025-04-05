// Ensure Node.js looks for modules in the backend folder
process.env.NODE_PATH = __dirname + "/node_modules";
require("module").Module._initPaths();

const express = require('express');
const cors = require('cors');
const { fetchAndStoreShodanData } = require("../../api/fetch_osint");
const supabase = require('./supabase');


require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());



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
    }});

app.get("/api/getThreatData", async (req, res) => {
  try {
    // Fetch TVA mapping data from Supabase
    const { data: tvaData, error: tvaError } = await supabase
      .from('tva_mapping')
      .select(`
          id,
          likelihood,
          impact,
          risk_score,
          assets:asset_id (id, asset_name, asset_type),
          threats:threat_id (id, threat_name, threat_type),
          vulnerabilities:vulnerability_id (id, vulnerability_name, cve_id, severity)
      `);

    if (tvaError) {
      throw tvaError;
    }

    // Transform data to match the expected frontend format
    const transformedData = tvaData.map(item => ({
      id: item.id,
      threat_name: item.threats?.threat_name || 'Unknown Threat',
      asset_name: item.assets?.asset_name || 'Unknown Asset',
      vulnerability_name: item.vulnerabilities?.vulnerability_name || 'Unknown Vulnerability',
      likelihood: item.likelihood,
      impact: item.impact,
      risk_score: item.risk_score,
      cve_id: item.vulnerabilities?.cve_id
    }));

    res.json(transformedData);
  } catch (error) {
    console.error('Error fetching threat data:', error);
    res.status(500).json({ error: 'Failed to fetch threat data' });
  }
});


// Endpoint to get high-risk threats
app.get("/api/getHighRiskThreats", async (req, res) => {
  try {
      const { data, error } = await supabase
          .from('tva_mapping')
          .select(`
              id,
              likelihood,
              impact,
              risk_score,
              assets:asset_id (id, asset_name, asset_type),
              threats:threat_id (id, threat_name, threat_type),
              vulnerabilities:vulnerability_id (id, vulnerability_name, cve_id, severity)
          `)
          .gt('risk_score', 15)
          .order('risk_score', { ascending: false });

      if (error) {
          throw error;
      }

      const transformedData = data.map(item => ({
          id: item.id,
          threat_name: item.threats?.threat_name || 'Unknown Threat',
          asset_name: item.assets?.asset_name || 'Unknown Asset',
          vulnerability_name: item.vulnerabilities?.vulnerability_name || 'Unknown Vulnerability',
          likelihood: item.likelihood,
          impact: item.impact,
          risk_score: item.risk_score,
          cve_id: item.vulnerabilities?.cve_id
      }));

      res.json(transformedData);
  } catch (error) {
      console.error('Error fetching high-risk threats:', error);
      res.status(500).json({ error: 'Failed to fetch high-risk threats' });
  }
});

// Endpoint to get recent alerts
app.get("/api/getRecentAlerts", async (req, res) => {
  try {
      const { data, error } = await supabase
          .from('alerts')
          .select(`
              id,
              alert_type,
              risk_score,
              description,
              status,
              created_at,
              threats:threat_id (id, threat_name)
          `)
          .order('created_at', { ascending: false })
          .limit(10);

      if (error) {
          throw error;
      }

      res.json(data);
  } catch (error) {
      console.error('Error fetching recent alerts:', error);
      res.status(500).json({ error: 'Failed to fetch recent alerts' });
  }
});



const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

