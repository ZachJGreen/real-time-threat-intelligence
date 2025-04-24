// /src/api_optimizer.js

require('dotenv').config();
const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');

// Supabase client initialization
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

// Only create the client if both URL and key are available
const supabase = (supabaseUrl && supabaseKey)
    ? createClient(supabaseUrl, supabaseKey)
    : null;

// API configuration
const SHODAN_API_KEY = process.env.SHODAN_API_KEY;
const SHODAN_BASE_URL = 'https://api.shodan.io/shodan/host';
const CACHE_TABLE = 'api_cache';
const CACHE_HOURS = 6;

/**
 * Fetch threat data for an IP address with caching
 * @param {string} ip - IP address to look up
 * @param {Object} options - Optional parameters
 * @param {boolean} options.forceFresh - Force fresh data retrieval, bypassing cache
 * @param {number} options.cacheHours - Override default cache duration
 * @returns {Promise<Object|null>} - Threat data or null if not found
 */
async function getOptimizedThreatData(ip, options = {}) {
    if (!ip) {
        throw new Error('IP address is required');
    }

    const { forceFresh = false, cacheHours = CACHE_HOURS } = options;

    try {
        // 1. Check cache if available and not forcing fresh data
        let data = null;

        if (supabase && !forceFresh) {
            const cachedData = await checkCache(ip);
            if (cachedData) {
                return cachedData;
            }
        }

        // 2. Fetch fresh data from Shodan API
        data = await fetchFromApi(ip);

        // 3. Cache the result if caching is available
        if (supabase && data) {
            await cacheResponse(ip, data, cacheHours);
        }

        return data;
    } catch (error) {
        console.error(`Error fetching threat data for ${ip}:`, error.message);

        // Return a structured error object instead of null
        return {
            error: true,
            message: error.message,
            status: error.response?.status || 500
        };
    }
}

/**
 * Check for valid cached data
 * @param {string} ip - IP address to look up
 * @returns {Promise<Object|null>} - Cached data or null
 */
async function checkCache(ip) {
    const { data: cached, error } = await supabase
        .from(CACHE_TABLE)
        .select('response, expires_at')
        .eq('api_type', 'shodan')
        .eq('query_key', ip)
        .single();

    const now = new Date();

    if (cached && !error && new Date(cached.expires_at) > now) {
        console.log(`[CACHE] Using cached result for ${ip}`);
        return cached.response;
    }

    return null;
}

/**
 * Fetch data from the API
 * @param {string} ip - IP address to look up
 * @returns {Promise<Object>} - API response data
 */
async function fetchFromApi(ip) {
    if (!SHODAN_API_KEY) {
        throw new Error('SHODAN_API_KEY not configured');
    }

    console.log(`[API] Fetching new result for ${ip}`);

    try {
        const response = await axios.get(`${SHODAN_BASE_URL}/${ip}`, {
            params: { key: SHODAN_API_KEY },
            timeout: 5000 // 5 second timeout
        });

        return response.data;
    } catch (apiError) {
        // Enhance error with more context
        if (apiError.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            const status = apiError.response.status;
            const message = apiError.response.data?.error || apiError.message;

            if (status === 404) {
                return { notFound: true, message: 'IP not found in Shodan database' };
            }

            throw new Error(`API error (${status}): ${message}`);
        } else {
            throw apiError;
        }
    }
}

/**
 * Cache API response in Supabase
 * @param {string} ip - IP address that was looked up
 * @param {Object} data - Response data to cache
 * @param {number} hours - Cache duration in hours
 */
async function cacheResponse(ip, data, hours) {
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + hours);

    const { error } = await supabase
        .from(CACHE_TABLE)
        .upsert({
            api_type: 'shodan',
            query_key: ip,
            response: data,
            expires_at: expiresAt.toISOString(),
            created_at: new Date().toISOString()
        });

    if (error) {
        console.error('Cache storage error:', error);
    }
}

// Rate limiting implementation
let lastRequestTimestamp = 0;
const MIN_REQUEST_INTERVAL = 1000; // 1 second between requests

/**
 * Get threat data for multiple IPs with rate limiting
 * @param {string[]} ips - Array of IP addresses
 * @returns {Promise<Object>} - Object mapping IPs to their data
 */
async function batchGetThreatData(ips) {
    const results = {};

    for (const ip of ips) {
        // Apply rate limiting
        const now = Date.now();
        const timeToWait = Math.max(0, MIN_REQUEST_INTERVAL - (now - lastRequestTimestamp));

        if (timeToWait > 0) {
            await new Promise(resolve => setTimeout(resolve, timeToWait));
        }

        lastRequestTimestamp = Date.now();
        results[ip] = await getOptimizedThreatData(ip);
    }

    return results;
}

// Test function
async function runTest() {
    try {
        const testIP = '8.8.8.8';

        // First call should hit the API
        console.log('First call (should hit API):');
        const data1 = await getOptimizedThreatData(testIP);
        console.log(data1 ? `✓ Data retrieved for ${testIP}` : `✗ No data retrieved`);

        // Second call should hit the cache
        console.log('\nSecond call (should hit cache):');
        const data2 = await getOptimizedThreatData(testIP);
        console.log(data2 ? `✓ Data retrieved for ${testIP}` : `✗ No data retrieved`);

        // Force fresh data
        console.log('\nForced fresh call (should hit API):');
        const data3 = await getOptimizedThreatData(testIP, { forceFresh: true });
        console.log(data3 ? `✓ Fresh data retrieved for ${testIP}` : `✗ No data retrieved`);

    } catch (error) {
        console.error('Test failed:', error.message);
    }
}

// Execute test if running directly
if (require.main === module) {
    runTest();
}

module.exports = {
    getOptimizedThreatData,
    batchGetThreatData
};