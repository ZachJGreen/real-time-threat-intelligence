require('dotenv').config({ path: '../../.env'});
const express = require('express');
const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const port = process.env.PORT || 5000;
app.use(express.json());

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Shodan API key
const SHODAN_API_KEY = process.env.SHODAN_API_KEY;


// Function to fetch data from Shodan API
const getShodanData = async (ip) => {
    try {
        // Check cache first
        const { data: cachedData, error: cacheError } = await supabase
            .from('api_cache')
            .select('response, expires_at')
            .eq('api_type', 'shodan')
            .eq('query_key', ip)
            .single();

        if (cachedData && !cacheError && new Date(cachedData.expires_at) > new Date()) {
            console.log(`Using cached Shodan data for ${ip}`);
            return cachedData.response;
        }

        // Make API call if no valid cache
        const url = `https://api.shodan.io/shodan/host/${ip}?key=${SHODAN_API_KEY}`;
        const response = await axios.get(url);
        
        // Store in cache
        const expiryTime = new Date();
        expiryTime.setHours(expiryTime.getHours() + 6); // Cache for 6 hours
        
        await supabase.from('api_cache').upsert({
            api_type: 'shodan',
            query_key: ip,
            response: response.data,
            expires_at: expiryTime.toISOString()
        });
        
        return response.data;
    } catch (error) {
        console.error(`Error fetching Shodan data: ${error.message}`);
        return null;
    }
};

// Function to store data in Supabase
const storeData = async (ip, data) => {
    try {
        // Extract the relevant data
        const ports = data.ports || [];
        const services = {};
        
        if (data.data) {
            data.data.forEach(service => {
                if (service.port && service.transport) {
                    services[service.port] = service.transport;
                }
            });
        }
        
        const hostnames = data.hostnames || [];
        const vulns = data.vulns || {};
        
        // Store in threat_data table
        const { error } = await supabase
            .from('threat_data')
            .upsert({
                ip_address: ip,
                ports: ports,
                services: services,
                hostnames: hostnames,
                vulns: vulns,
                last_scan: new Date().toISOString(),
                raw_data: data
            });

        if (error) {
            throw error;
        }
        
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

    const result = await storeData(ip, shodanData);
    res.json(result);
});

// Start the server
app.listen(port, () => {
    console.log(`Shodan API server running on http://localhost:${port}`);
});

module.exports = { getShodanData, storeData };
