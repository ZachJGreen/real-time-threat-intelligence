const fs = require('fs');
const path = require('path');
const { createGzip } = require('zlib');
const { createWriteStream, existsSync, mkdirSync } = require('fs');
const { format } = require('date-fns');
const supabase = require('./supabase');

// Configure log directory
const LOG_DIR = process.env.LOG_DIR || path.join(__dirname, '../../logs');
const MAX_LOG_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_LOG_FILES = 10;

// Ensure log directory exists
if (!existsSync(LOG_DIR)) {
    mkdirSync(LOG_DIR, { recursive: true });
}

// Log levels with numerical values for filtering
const LOG_LEVELS = {
    DEBUG: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3,
    CRITICAL: 4
};

// Set current log level from environment or default to INFO
const CURRENT_LOG_LEVEL = LOG_LEVELS[process.env.LOG_LEVEL] || LOG_LEVELS.INFO;

// Define log file paths
const logFiles = {
    threat: path.join(LOG_DIR, 'threat_events.log'),
    system: path.join(LOG_DIR, 'system.log'),
    access: path.join(LOG_DIR, 'access.log'),
    error: path.join(LOG_DIR, 'error.log')
};

// Log streams for writing
const logStreams = {};

/**
 * Initialize log streams
 */
function initializeLogStreams() {
    for (const [key, filePath] of Object.entries(logFiles)) {
        logStreams[key] = createWriteStream(filePath, { flags: 'a' });
    }

    // Handle unexpected errors with streams
    for (const stream of Object.values(logStreams)) {
        stream.on('error', (err) => {
            console.error('Error with log stream:', err);
        });
    }
}

/**
 * Format a log message with timestamp and metadata
 * @param {string} level - Log level
 * @param {string} message - Log message
 * @param {object} metadata - Additional metadata
 * @returns {string} - Formatted log string
 */
function formatLogMessage(level, message, metadata = {}) {
    const timestamp = format(new Date(), 'yyyy-MM-dd HH:mm:ss.SSS');
    const metadataStr = Object.keys(metadata).length 
        ? JSON.stringify(metadata) 
        : '';
    
    return `[${timestamp}] [${level}] ${message} ${metadataStr}`.trim() + '\n';
}

/**
 * Check if the log file needs rotation
 * @param {string} filePath - Path to log file
 * @returns {boolean} - Whether rotation is needed
 */
function needsRotation(filePath) {
    if (!existsSync(filePath)) {
        return false;
    }
    
    const stats = fs.statSync(filePath);
    return stats.size >= MAX_LOG_SIZE;
}

/**
 * Rotate a log file
 * @param {string} filePath - Log file to rotate
 */
async function rotateLogFile(filePath) {
    if (!existsSync(filePath)) {
        return;
    }

    // Close the stream if it exists
    const streamKey = Object.keys(logFiles).find(key => logFiles[key] === filePath);
    if (streamKey && logStreams[streamKey]) {
        logStreams[streamKey].end();
        delete logStreams[streamKey];
    }

    // Create timestamp for rotated file
    const timestamp = format(new Date(), 'yyyyMMdd-HHmmss');
    const baseFileName = path.basename(filePath);
    const rotatedFilePath = path.join(LOG_DIR, `${baseFileName}.${timestamp}.gz`);

    // Compress and move the log file
    const readStream = fs.createReadStream(filePath);
    const writeStream = createWriteStream(rotatedFilePath);
    const gzipStream = createGzip();

    await new Promise((resolve, reject) => {
        readStream
            .pipe(gzipStream)
            .pipe(writeStream)
            .on('finish', resolve)
            .on('error', reject);
    });

    // Delete original file
    fs.unlinkSync(filePath);

    // Recreate the stream
    if (streamKey) {
        logStreams[streamKey] = createWriteStream(filePath, { flags: 'a' });
    }

    // Cleanup old log files if we have too many
    cleanupOldLogs(baseFileName);
}

/**
 * Clean up old log files if we have too many
 * @param {string} baseFileName - Base name of the log file
 */
function cleanupOldLogs(baseFileName) {
    const logFiles = fs.readdirSync(LOG_DIR)
        .filter(file => file.startsWith(baseFileName) && file.endsWith('.gz'))
        .map(file => ({
            name: file,
            path: path.join(LOG_DIR, file),
            time: fs.statSync(path.join(LOG_DIR, file)).mtime.getTime()
        }))
        .sort((a, b) => b.time - a.time); // Sort newest first

    // Delete old files beyond the limit
    if (logFiles.length > MAX_LOG_FILES) {
        logFiles.slice(MAX_LOG_FILES).forEach(file => {
            try {
                fs.unlinkSync(file.path);
            } catch (err) {
                console.error(`Failed to delete old log file ${file.path}:`, err);
            }
        });
    }
}

/**
 * Write a log message to the appropriate stream
 * @param {string} stream - Stream name
 * @param {string} level - Log level
 * @param {string} message - Log message
 * @param {object} metadata - Additional metadata
 */
async function writeToLog(stream, level, message, metadata = {}) {
    // Check if we need to log based on log level
    if (LOG_LEVELS[level] < CURRENT_LOG_LEVEL) {
        return;
    }

    // Initialize streams if needed
    if (Object.keys(logStreams).length === 0) {
        initializeLogStreams();
    }

    // Check if log needs rotation
    const logFile = logFiles[stream];
    if (needsRotation(logFile)) {
        await rotateLogFile(logFile);
    }

    // Format and write log message
    const formattedMessage = formatLogMessage(level, message, metadata);
    
    if (logStreams[stream]) {
        logStreams[stream].write(formattedMessage);
    }

    // Always write errors to the error log as well
    if (level === 'ERROR' || level === 'CRITICAL') {
        if (stream !== 'error' && logStreams.error) {
            logStreams.error.write(formattedMessage);
        }
    }

    // For critical events, also log to console
    if (level === 'CRITICAL') {
        console.error(formattedMessage);
    }
}

/**
 * Log a threat event
 * @param {string} threatType - Type of threat
 * @param {number} riskScore - Calculated risk score
 * @param {object} details - Additional threat details
 */
async function logThreat(threatType, riskScore, details = {}) {
    const level = riskScore >= 20 ? 'CRITICAL' : 
                 riskScore >= 15 ? 'ERROR' : 
                 riskScore >= 10 ? 'WARN' : 'INFO';
                 
    const message = `Threat Detected: ${threatType} (Risk Score: ${riskScore})`;
    
    // Add timestamp to details
    const enhancedDetails = {
        ...details,
        timestamp: new Date().toISOString(),
        risk_score: riskScore
    };

    // Log to file
    await writeToLog('threat', level, message, enhancedDetails);

    // For high-risk threats, also store in database for persistence
    if (riskScore >= 15) {
        try {
            await storeTheatEventInDatabase(threatType, riskScore, enhancedDetails);
        } catch (error) {
            await writeToLog('error', 'ERROR', 'Failed to store threat event in database', { 
                error: error.message,
                threat: threatType
            });
        }
    }
}

/**
 * Store threat event in database for historical records
 * @param {string} threatType - Type of threat
 * @param {number} riskScore - Risk score
 * @param {object} details - Event details
 */
async function storeTheatEventInDatabase(threatType, riskScore, details) {
    if (!supabase) {
        return;
    }

    try {
        const { error } = await supabase
            .from('security_logs')
            .insert({
                log_type: 'THREAT',
                severity: riskScore >= 20 ? 'CRITICAL' : 
                         riskScore >= 15 ? 'HIGH' : 
                         riskScore >= 10 ? 'MEDIUM' : 'LOW',
                message: `Threat Detected: ${threatType}`,
                risk_score: riskScore,
                details: details,
                created_at: new Date().toISOString()
            });

        if (error) {
            throw error;
        }
    } catch (error) {
        // Don't let database errors bubble up - just log them
        console.error('Error storing security log:', error);
    }
}

/**
 * Log system activities
 * @param {string} level - Log level (DEBUG, INFO, WARN, ERROR, CRITICAL)
 * @param {string} message - Log message
 * @param {object} metadata - Additional metadata
 */
async function logSystem(level, message, metadata = {}) {
    // Validate log level
    if (!Object.keys(LOG_LEVELS).includes(level)) {
        level = 'INFO';
    }
    
    await writeToLog('system', level, message, metadata);
}

/**
 * Log API access
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {number} responseTime - Response time in ms
 */
async function logAccess(req, res, responseTime) {
    const metadata = {
        method: req.method,
        url: req.originalUrl || req.url,
        ip: req.ip || req.connection.remoteAddress,
        statusCode: res.statusCode,
        userAgent: req.headers['user-agent'],
        responseTime: `${responseTime}ms`
    };

    // Determine log level based on status code
    let level = 'INFO';
    if (res.statusCode >= 500) level = 'ERROR';
    else if (res.statusCode >= 400) level = 'WARN';

    const message = `${req.method} ${req.originalUrl || req.url} ${res.statusCode}`;
    await writeToLog('access', level, message, metadata);
}

/**
 * Express middleware for logging API access
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Next middleware function
 */
function accessLogger(req, res, next) {
    const startTime = Date.now();
    
    // Function to log after response is sent
    const logAfterResponse = () => {
        const responseTime = Date.now() - startTime;
        logAccess(req, res, responseTime).catch(console.error);
    };

    // Log when response is finished
    res.on('finish', logAfterResponse);
    res.on('close', logAfterResponse);
    
    next();
}

/**
 * Close all log streams - should be called when shutting down
 */
function closeLogStreams() {
    for (const [key, stream] of Object.entries(logStreams)) {
        stream.end();
    }
}

/**
 * Get logs for the specified type
 * @param {string} type - Log type
 * @param {object} options - Options for filtering
 * @returns {Promise<Array>} - Array of log entries
 */
async function getLogs(type = 'threat', options = {}) {
    const { limit = 100, level, startDate, endDate } = options;
    
    // Get logs from database if available
    if (supabase && (type === 'threat' || type === 'security')) {
        let query = supabase
            .from('security_logs')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(limit);
            
        if (level) {
            query = query.eq('severity', level);
        }
        
        if (startDate) {
            query = query.gte('created_at', new Date(startDate).toISOString());
        }
        
        if (endDate) {
            query = query.lte('created_at', new Date(endDate).toISOString());
        }
        
        const { data, error } = await query;
        
        if (error) {
            throw error;
        }
        
        return data;
    }
    
    // Fall back to reading from log files
    const logFile = logFiles[type] || logFiles.threat;
    
    if (!existsSync(logFile)) {
        return [];
    }
    
    // Read log file and parse entries
    const content = fs.readFileSync(logFile, 'utf8');
    const lines = content.split('\n').filter(line => line.trim() !== '');
    
    // Parse and filter log entries
    const parsedLogs = lines.map(line => {
        // Regular expression to extract log parts
        const regex = /\[(.*?)\] \[(.*?)\] (.*?)(?:\s+(\{.*\}))?$/;
        const match = line.match(regex);
        
        if (!match) {
            return null;
        }
        
        const [_, timestamp, logLevel, message, metadataStr] = match;
        let metadata = {};
        
        if (metadataStr) {
            try {
                metadata = JSON.parse(metadataStr);
            } catch (e) {
                // Ignore parsing errors
            }
        }
        
        return { timestamp, level: logLevel, message, ...metadata };
    }).filter(log => log !== null);
    
    // Apply filters
    let filteredLogs = parsedLogs;
    
    if (level) {
        filteredLogs = filteredLogs.filter(log => log.level === level);
    }
    
    if (startDate) {
        const start = new Date(startDate).getTime();
        filteredLogs = filteredLogs.filter(log => new Date(log.timestamp).getTime() >= start);
    }
    
    if (endDate) {
        const end = new Date(endDate).getTime();
        filteredLogs = filteredLogs.filter(log => new Date(log.timestamp).getTime() <= end);
    }
    
    // Return the most recent logs up to the limit
    return filteredLogs.slice(0, limit);
}

// Initialize on module load
initializeLogStreams();

// Export API
module.exports = {
    // Main logging functions
    logThreat,
    logSystem,
    logAccess,
    
    // Express middleware
    accessLogger,
    
    // Utilities
    closeLogStreams,
    getLogs,
    
    // Constants
    LOG_LEVELS
};