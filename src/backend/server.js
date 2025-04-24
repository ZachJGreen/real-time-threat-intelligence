require('dotenv').config({ path: '../../.env'});
const cors = require("cors");


// Ensure Node.js looks for modules in the backend folder
process.env.NODE_PATH = __dirname + "/node_modules";
require("module").Module._initPaths();

const express = require('express');
const cors = require("cors");
const { fetchShodanData } = require("../../api/fetch_osint");
const { Pool } = require('pg');

require('dotenv').config();

const app = express();
app.use(cors({
    origin: "*", // allow all origins
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // allow all HTTP methods
  }));  
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

app.get("/api/getThreatData", async (req, res) => {
  try {
    console.log("🔄 Received frontend request for threat data");
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

// Endpoint to perform CBA for a specific threat
app.post("/api/performCBA", async (req, res) => {
  try {
      const { threatId, threatType, assetValue, controls } = req.body;
      
      if (!threatType || !assetValue) {
          return res.status(400).json({
              error: "Missing required parameters. Please provide threatType and assetValue."
          });
      }
      
      // Use provided controls or get defaults based on threat type
      const securityControls = controls || cbaAnalysis.getDefaultControls(threatType);
      
      if (securityControls.length === 0) {
          return res.status(404).json({
              error: "No security controls found for this threat type",
              message: "Please provide custom controls or use a recognized threat type"
          });
      }
      
      const results = await cbaAnalysis.evaluateSecurityControls(
          threatId,
          assetValue,
          securityControls
      );
      
      // Store the CBA results in Supabase for historical reference
      if (results.length > 0) {
          const { error } = await supabase
              .from('cba_analyses')
              .insert({
                  threat_id: threatId,
                  asset_value: assetValue,
                  analysis_date: new Date().toISOString(),
                  results: results
              });
              
          if (error) {
              console.error("Error storing CBA results:", error);
          }
      }
      
      res.json(results);
  } catch (error) {
      console.error("Error performing CBA:", error);
      res.status(500).json({
          error: "Error performing cost-benefit analysis",
          message: error.message
      });
  }
});

// Endpoint to get historical CBA analyses
app.get("/api/cbaHistory", async (req, res) => {
  try {
      const { data, error } = await supabase
          .from('cba_analyses')
          .select('*')
          .order('analysis_date', { ascending: false });
          
      if (error) {
          throw error;
      }
      
      res.json(data);
  } catch (error) {
      console.error("Error fetching CBA history:", error);
      res.status(500).json({
          error: "Error fetching CBA history",
          message: error.message
      });
  }
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

