require('dotenv').config({ path: './.env'});
const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');
const { handleThreat } = require('../src/backend/alerts.js');

// Environment configuration
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);
const SHODAN_API_KEY = process.env.SHODAN_API_KEY;



/**
 * Fetches data from Shodan for a given IP address
 * @param {string} ip - The IP address to analyze 
 * @returns {Promise<object>} - Shodan data
 */
async function fetchShodanData(ip) {
    // Check cache first
    try {
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
    } catch (error) {
        console.log("Cache check error or no cache found - proceeding with API call");
    }

    // Make fresh API call if no valid cache
    const url = `https://api.shodan.io/shodan/host/${ip}?key=${shodanApiKey}`;

    try {
        console.log(`Fetching fresh Shodan data for ${ip}`);
        const response = await axios.get(url);
        const data = response.data;

        // Store in cache for future use
        const expiryTime = new Date();
        expiryTime.setHours(expiryTime.getHours() + 6); // Cache for 6 hours
        
        await supabase.from('api_cache').upsert({
            api_type: 'shodan',
            query_key: ip,
            response: data,
            expires_at: expiryTime.toISOString()
        });

        return data;
    } catch (error) {
        console.error("Error fetching from Shodan:", error.response?.data || error.message);
        return null;
    }
}

/**
 * Stores Shodan data in the database and processes threat information
 * @param {string} ip - The IP address
 * @param {object} data - Shodan data to store
 * @returns {Promise<object>} - Result of storage operation
 */
async function storeShodanData(ip, data) {
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
        
        // Calculate risk score for threat alerting
        const numberOfPorts = ports.length;
        const hasVulnerabilities = Object.keys(vulns).length > 0;
        const riskScore = numberOfPorts * 2 + (hasVulnerabilities ? 30 : 0);

        // Trigger alert if high risk
        if (riskScore > 20) {
            handleThreat({
                name: `High Risk Threat for ${ip}`,
                riskScore: riskScore,
            });
        }
        
        return { 
            message: `Data stored successfully for ${ip}`,
            riskScore: riskScore
        };
    } catch (error) {
        console.error(`Error storing data: ${error.message}`);
        return { error: error.message };
    }
}

/**
 * Main function to fetch and store Shodan data
 * @param {string} ip - The IP address to process
 * @returns {Promise<object>} - Combined result of fetch and store operations
 */
async function fetchAndStoreShodanData(ip) {
    try {
        const shodanData = await fetchShodanData(ip);
        if (!shodanData) {
            throw new Error("Failed to fetch data from Shodan");
        }
        
        const result = await storeShodanData(ip, shodanData);
        return {
            success: true,
            ...result,
            data: shodanData
        };
    } catch (error) {
        console.error(`Error in fetchAndStoreShodanData: ${error.message}`);
        return {
            success: false,
            error: error.message
        };
    }
}

// Export for use in other modules
module.exports = { 
    fetchShodanData,
    storeShodanData,
    fetchAndStoreShodanData
};
