const express = require('express');
const router = express.Router();
const { fetchAndStoreShodanData } = require('./shodan_integration');

/**
 * API route for fetching and storing Shodan threat intelligence
 * GET /shodan?ip=<ip_address>
 */
router.get('/shodan', async (req, res) => {
    const ip = req.query.ip;
    if (!ip) {
        return res.status(400).json({ error: "IP address is required" });
    }

    try {
        const result = await fetchAndStoreShodanData(ip);
        
        if (result.success) {
            res.json({
                success: true,
                message: result.message,
                riskScore: result.riskScore,
                data: result.data
            });
        } else {
            res.status(500).json({
                success: false,
                error: result.error
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * API route for manually triggering Shodan scan for multiple IPs
 * POST /shodan/scan
 * Body: { ips: ['ip1', 'ip2', ...] }
 */
router.post('/shodan/scan', async (req, res) => {
    const { ips } = req.body;
    
    if (!Array.isArray(ips) || ips.length === 0) {
        return res.status(400).json({ error: "IPs array is required" });
    }

    const results = [];
    
    for (const ip of ips) {
        try {
            const result = await fetchAndStoreShodanData(ip);
            results.push({
                ip,
                ...result
            });
        } catch (error) {
            results.push({
                ip,
                success: false,
                error: error.message
            });
        }
    }

    res.json({ results });
});

module.exports = router;