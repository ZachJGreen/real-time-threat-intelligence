require('dotenv').config({ path: '../../../.env' });
const path = require('path');
const fs = require('fs');
const { 
    logThreat, 
    logSystem, 
    logAccess, 
    closeLogStreams,
    getLogs
} = require('../logging');

// Test logging
async function runTests() {
    console.log('Running logging tests...');
    
    // Test directory
    const logDir = process.env.LOG_DIR || path.join(__dirname, '../../../logs');
    console.log(`Log directory: ${logDir}`);
    
    // Create log directory if it doesn't exist
    if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
        console.log('Created log directory');
    }
    
    try {
        // Test threat logging
        console.log('Testing threat logging...');
        await logThreat('SQL Injection', 25, {
            source_ip: '192.168.1.100',
            target: 'login-api',
            payload: "' OR 1=1 --",
            user_agent: 'Mozilla/5.0'
        });
        
        await logThreat('Suspicious Login', 15, {
            source_ip: '203.0.113.42',
            username: 'admin',
            location: 'Unknown location'
        });
        
        await logThreat('Port Scan', 10, {
            source_ip: '198.51.100.77',
            ports_scanned: [22, 80, 443, 3389]
        });
        
        // Test system logging
        console.log('Testing system logging...');
        await logSystem('INFO', 'Application started', { 
            version: '1.0.0',
            environment: 'testing' 
        });
        
        await logSystem('WARN', 'Database connection slow', { 
            latency: '1200ms',
            query: 'SELECT * FROM large_table' 
        });
        
        await logSystem('ERROR', 'Failed to connect to external API', { 
            api: 'shodan',
            error: 'Connection timeout' 
        });
        
        // Test access logging
        console.log('Testing access logging...');
        const mockReq = {
            method: 'GET',
            originalUrl: '/api/threats',
            ip: '10.0.0.1',
            headers: {
                'user-agent': 'Test Agent 1.0'
            }
        };
        
        const mockRes = {
            statusCode: 200,
            on: (event, callback) => {
                if (event === 'finish') {
                    callback();
                }
            }
        };
        
        await logAccess(mockReq, mockRes, 45);
        
        // Read logs back
        console.log('Reading logs...');
        const threatLogs = await getLogs('threat', { limit: 10 });
        console.log(`Retrieved ${threatLogs.length} threat logs`);
        
        if (threatLogs.length > 0) {
            console.log('Latest threat log:', threatLogs[0]);
        }
        
        // Test successful
        console.log('\n✅ All logging tests completed successfully!\n');
    } catch (error) {
        console.error('❌ Error during logging tests:', error);
    } finally {
        // Ensure we close all streams
        closeLogStreams();
    }
}

// Run the tests
runTests();