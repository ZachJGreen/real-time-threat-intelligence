require('dotenv').config();
const express = require('express');
const axios = require('axios');
const { Pool } = require('pg');

const app = express();
const port = 5000;

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

// API route for fetching and storing threat intelligence
app.get('/shodan', async (req, res) => {
    const ip = req.query.ip;
    if (!ip) {
        return res.status(400).json({ error: "IP address is required" });
    }

    const shodanData = await getShodanData(ip);
    if (!shodanData) {
        return res.status(500).json({ error: "Failed to fetch data from Shodan" });
    }

    const ports = shodanData.ports || [];
    const services = shodanData.hostnames || [];

    const result = await storeData(ip, ports, services);
    res.json(result);
});

// Start the server
app.listen(port, () => {
    console.log(`Shodan API server running on http://localhost:${port}`);
});
