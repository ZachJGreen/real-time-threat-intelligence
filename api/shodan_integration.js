require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors'); // cross-origin resource sharing to connect front and backend
const { Pool } = require('pg');

const app = express();
const port = 5000;
app.use(cors());
// Load API key from environment variables
const SHODAN_API_KEY = process.env.SHODAN_API_KEY;

// PostgreSQL database configuration
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'threat_intelligence_db',
    port: 5432,
    password: '12345', 
});

// Function to fetch data from Shodan API
const getShodanData = async (ip) => {
    try {
        const url = `https://api.shodan.io/shodan/host/${ip}?key=${SHODAN_API_KEY}`;
        const response = await axios.get(url);
        return response.data;
    } catch (error) {
        console.error(`Error fetching Shodan data: ${error.message}`);
        return null;
    }
};

// Function to store data in PostgreSQL
const storeData = async (ip, ports, services) => {
    try {
        const client = await pool.connect();
        const query = `
            INSERT INTO threat_data (ip_address, ports, services)
            VALUES ($1, $2, $3)
        `;
        await client.query(query, [ip, JSON.stringify(ports), JSON.stringify(services)]);
        client.release();
        return { message: `Data stored successfully for ${ip}` };
    } catch (error) {
        console.error(`Error storing data: ${error.message}`);
        return { error: error.message };
    }
};

// Expose a function to fetch and store Shodan data
const fetchAndStoreShodanData = async (ip) => {
    const shodanData = await getShodanData(ip);
    if (!shodanData) {
        console.error("Failed to fetch data from Shodan");
        return;
    }

    const ports = shodanData.ports || [];
    const services = shodanData.hostnames || [];

    await storeData(ip, ports, services);
};


// Endpoint to fetch stored threat data
app.get('/api/threats', async (req, res) => {
    try {
      const client = await pool.connect();
      const result = await client.query('SELECT * FROM threat_data');
      client.release();
  
      const threatData = result.rows.map((row) => ({
        ip_address: row.ip_address,
        ports: JSON.parse(row.ports), // assuming ports are stored as a JSON string
        services: JSON.parse(row.services), // assuming services are stored as a JSON string
        risk_score: row.risk_score, // Add this if you have a `risk_score` column
      }));
  
      res.json(threatData);
    } catch (error) {
      console.error('Error fetching threats:', error);
      res.status(500).json({ error: 'Failed to fetch threat data' });
    }
  });
  

  

// Export the functions for use in the scheduler
module.exports = {
    fetchAndStoreShodanData,
};

// Start the server
app.listen(port, () => {
    console.log(`Shodan API server running on http://localhost:${port}`);
});
