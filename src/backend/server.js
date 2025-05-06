require('dotenv').config({ path: '../../.env'});
const express = require('express');
const cors = require("cors");
const { createClient } = require('@supabase/supabase-js');
const { fetchAndStoreShodanData } = require("../../api/shodan_integration");
const shodanRouter = require("../../api/shodan_router");
const { getIncidentResponsePlan } = require("./incident_response");
const cbaAnalysis = require('./cba_analysis');
const logger = require('./logging');
const threatMitigation = require('./threat_mitigation');

const app = express();

// Middleware
app.use(cors({
    origin: "*", // allow all origins
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // allow all HTTP methods
  }));
app.use(express.json());
app.use(logger.accessLogger);

// Initialize supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Root endpoint
app.get('/', (req, res) => {
  logger.logSystem('INFO', 'Root endpoint accessed');
    res.send('Welcome to the Real-Time Threat Intelligence API!');
});

// Mount the Shodan router
app.use('/api', shodanRouter);

// Fetch Shodan threat data
app.post("/api/fetchShodanThreatData", async (req, res) => {
  const { ip } = req.body;  // Use req.body to access the IP

  if (!ip) {
      return res.status(400).json({ message: "IP address is required" });
  }

  try {
    const result = await fetchAndStoreShodanData(ip);
    if (result.success) {
        res.json({ 
            message: "Shodan threat data fetched and stored successfully",
            riskScore: result.riskScore 
        });
    } else {
        res.status(500).json({ 
            message: "Error fetching or storing Shodan data", 
            error: result.error 
        });
    }
} catch (error) {
    res.status(500).json({ 
        message: "Error fetching or storing Shodan data", 
        error: error.message 
    });
}
});

// Get threat data for dashboard
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


// Get high-risk threats
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

// Get recent alerts
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


// Update alert status
app.post("/api/updateAlertStatus", async (req, res) => {
    try {
        const { id, status } = req.body;

        if (!id || !status) {
            return res.status(400).json({ error: "Missing required parameters" });
        }

        const { data, error } = await supabase
            .from('alerts')
            .update({ status: status })
            .eq('id', id)
            .select();

        if (error) {
            throw error;
        }

        res.json({ message: "Alert status updated successfully", data });
    } catch (error) {
        console.error('Error updating alert status:', error);
        res.status(500).json({ error: 'Failed to update alert status' });
    }
});

// Get all alerts (open and acknowledged)
app.get("/api/getAllAlerts", async (req, res) => {
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
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    res.json(data);
  } catch (error) {
    console.error('Error fetching all alerts:', error);
    res.status(500).json({ error: 'Failed to fetch alerts' });
  }
});



// Create a new alert (for testing or manual creation)
app.post("/api/createAlert", async (req, res) => {
    try {
      const { threat_name, risk_score, description } = req.body;
      
      if (!threat_name || !risk_score) {
        logger.logSystem('WARN', 'Missing parameters in createAlert request', req.body);
        return res.status(400).json({ error: "Missing required parameters" });
      }

      // Log the threat detection
      await logger.logThreat(threat_name, risk_score, {
        description: description || `${threat_name} detected with risk score of ${risk_score}`,
        source: 'manual',
        created_by: req.ip || 'unknown'
      });
      
      // Find associated threat
      const { data: threats } = await supabase
        .from('threats')
        .select('id')
        .ilike('threat_name', `%${threat_name}%`)
        .limit(1);
      
      const threat_id = threats && threats.length > 0 ? threats[0].id : null;
      
      // Create the alert
      const { data, error } = await supabase
        .from('alerts')
        .insert({
          alert_type: risk_score >= 20 ? 'Critical' : 'High Risk',
          threat_id: threat_id,
          risk_score: risk_score,
          description: description || `${threat_name} detected with risk score of ${risk_score}`,
          status: 'Open',
          created_at: new Date().toISOString()
        })
        .select();
     
        if (error) {
          logger.logSystem('ERROR', 'Error creating alert in database', { error: error.message });
          throw error;
        }
        logger.logSystem('INFO', 'Alert created successfully', { alert_id: data[0].id });

        // For critical and high-risk threats, trigger automatic mitigation
      let mitigationResult = null;
      if (risk_score >= 15) {
        try {
          // Create threat object from alert data
          const threat = {
            id: data[0].id,
            type: threat_name,
            riskScore: risk_score,
            details: {
              description: description,
              source: 'alert',
              alertId: data[0].id
            }
          };
          
          // Trigger mitigation asynchronously (don't await, so response isn't delayed)
          mitigationResult = { status: 'initiated' };
          
          // Use setTimeout to not block the response
          setTimeout(async () => {
            try {
              const result = await threatMitigation.mitigateThreat(threat);
              logger.logSystem('INFO', 'Automatic mitigation completed', { 
                alert_id: data[0].id,
                success: result.success
              });
            } catch (mitErr) {
              logger.logSystem('ERROR', 'Automatic mitigation failed', {
                alert_id: data[0].id,
                error: mitErr.message
              });
            }
          }, 0);
        } catch (mitErr) {
          logger.logSystem('ERROR', 'Failed to initiate automatic mitigation', {
            alert_id: data[0].id,
            error: mitErr.message
          });
        }
      }

        res.json({
          message: "Alert created successfully",
          data,
          mitigation: mitigationResult
        });

        } catch (error) {
          logger.logSystem('ERROR', 'Failed to create alert', { error: error.message });
          console.error('Error creating alert:', error);
          res.status(500).json({ error: 'Failed to create alert' });
        }
      });

// Perform CBA
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

// Get CBA history
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


// Incident reponse endpoint
app.get("/api/incidentResponse", (req, res) => {
    const { threatType } = req.query;
    if (!threatType) {
        return res.status(400).json({ error: "Missing threatType parameter" });
    }

    const plan = getIncidentResponsePlan(threatType);
    res.json({ threatType, responsePlan: plan });
});

// Trigger manual mitigation for a threat
app.post("/api/mitigateThreat", async (req, res) => {
  try {
      const { threatType, riskScore, details } = req.body;
      
      if (!threatType || !riskScore) {
          return res.status(400).json({ 
              error: "Missing required parameters. Please provide threatType and riskScore." 
          });
      }
      
      // Create threat object
      const threat = {
          type: threatType,
          riskScore,
          details: details || {}
      };
      
      // Trigger mitigation
      const result = await threatMitigation.mitigateThreat(threat);
      
      res.json(result);
  } catch (error) {
      console.error("Error mitigating threat:", error);
      res.status(500).json({
          error: "Error during threat mitigation",
          message: error.message
      });
  }
});

// Get mitigation history
app.get("/api/mitigationHistory", async (req, res) => {
  try {
      const { limit, threatType, severity } = req.query;
      
      const options = {};
      if (limit) options.limit = parseInt(limit);
      if (threatType) options.threatType = threatType;
      if (severity) options.severity = severity;
      
      const history = await threatMitigation.getMitigationHistory(options);
      
      res.json(history);
  } catch (error) {
      console.error("Error fetching mitigation history:", error);
      res.status(500).json({
          error: "Error fetching mitigation history",
          message: error.message
      });
  }
});

// Get mitigation effectiveness metrics
app.get("/api/mitigationEffectiveness", async (req, res) => {
  try {
      const effectiveness = await threatMitigation.getMitigationEffectiveness();
      
      res.json(effectiveness);
  } catch (error) {
      console.error("Error fetching mitigation effectiveness:", error);
      res.status(500).json({
          error: "Error fetching mitigation effectiveness",
          message: error.message
      });
  }
});

// Global error handler with logging
app.use((err, req, res, next) => {
  logger.logSystem('ERROR', 'Unhandled exception in API request', {
      path: req.path,
      method: req.method,
      error: err.message,
      stack: err.stack
  });
  
  res.status(500).json({
      error: 'Internal Server Error',
      message: 'An unexpected error occurred'
  });
});

// Start server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Graceful shutdown handling
process.on('SIGTERM', () => {
  logger.logSystem('INFO', 'SIGTERM received, shutting down gracefully');
  
  // Close log streams
  logger.closeLogStreams();
  
  server.close(() => {
      logger.logSystem('INFO', 'Server closed');
      process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.logSystem('INFO', 'SIGINT received, shutting down gracefully');
  
  // Close log streams
  logger.closeLogStreams();
  
  server.close(() => {
      logger.logSystem('INFO', 'Server closed');
      process.exit(0);
  });
});