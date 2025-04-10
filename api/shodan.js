
require('dotenv').config({ path: './.env' });
const axios = require("axios");
const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Shodan API key
const shodanApiKey = process.env.SHODAN_API_KEY;

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

module.exports = { fetchShodanData };
