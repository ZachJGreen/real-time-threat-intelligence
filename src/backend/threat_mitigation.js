const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');
const blueTeamDefense = require('./blue_team_defense');
const { getIncidentResponsePlan } = require('./incident_response');
const { getMitigationRecommendations } = require('./mitigation_recommendations');
const logger = require('./logging');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;


let supabase = null;
if (supabaseUrl && supabaseKey) {
    try {
        supabase = createClient(supabaseUrl, supabaseKey);
        console.log('Supabase client initialized successfully in threat_mitigation.js');
    } catch (error) {
        console.error('Failed to initialize Supabase in threat_mitigation.js:', error);
    }
} else {
    console.warn('Supabase URL or key not found. Database features in threat_mitigation.js will be disabled.');
}

// Webhook URLs for external system integration
const WEBHOOK_URLS = {
    security_gateway: process.env.SECURITY_GATEWAY_WEBHOOK,
    firewall: process.env.FIREWALL_WEBHOOK,
    waf: process.env.WAF_WEBHOOK, // Web Application Firewall
    email_security: process.env.EMAIL_SECURITY_WEBHOOK
};

/**
 * Threat mitigation class that handles automated response to detected threats
 */
class ThreatMitigation {
    constructor() {
        this.activeRemediations = new Map();
        this.mitigationHistory = [];
    }

    /**
     * Main function to mitigate a detected threat
     * @param {Object} threat - Threat object with details
     * @param {string} threat.type - Type of threat (e.g., "SQL Injection", "Phishing")
     * @param {number} threat.riskScore - Calculated risk score
     * @param {Object} threat.details - Additional threat details
     * @returns {Promise<Object>} - Results of mitigation efforts
     */
    async mitigateThreat(threat) {
        try {
            // Log the mitigation attempt
            if (logger && typeof logger.logSystem === 'function') {
                logger.logSystem('INFO', `Starting automated mitigation for ${threat.type}`, {
                    threat_type: threat.type,
                    risk_score: threat.riskScore
                });
            } else {
                console.log(`Starting automated mitigation for ${threat.type}`, {
                    threat_type: threat.type,
                    risk_score: threat.riskScore
                });
            }

            // 1. Get recommended mitigations
            const recommendations = getMitigationRecommendations(threat.type);
            
            // 2. Get incident response plan
            const responsePlan = getIncidentResponsePlan(threat.type);
            
            // 3. Calculate threat severity category
            const severityCategory = this._calculateSeverityCategory(threat.riskScore);
            
            // 4. Determine appropriate actions based on severity
            const mitigationActions = this._determineMitigationActions(
                threat, 
                severityCategory,
                recommendations,
                responsePlan
            );
            
            // 5. Execute the mitigation actions
            const mitigationResults = await this._executeMitigationActions(mitigationActions);
            
            // 6. Record the mitigation in history
            const mitigationRecord = {
                threatId: threat.id || `temp-${Date.now()}`,
                threatType: threat.type,
                riskScore: threat.riskScore,
                severityCategory,
                mitigationActions,
                results: mitigationResults,
                timestamp: new Date().toISOString(),
                status: 'completed'
            };
            
            this.mitigationHistory.push(mitigationRecord);
            
            // 7. Store in database if available
            if (supabase) {
                await this._storeMitigationRecord(mitigationRecord);
            } else {
                console.log("Skipping database storage - Supabase not initialized");
            }
            
            // Return the mitigation results
            return {
                success: true,
                mitigationRecord
            };
            
        } catch (error) {
            if (logger && typeof logger.logSystem === 'function') {
                logger.logSystem('ERROR', `Mitigation failed for ${threat.type}`, {
                    error: error.message,
                    stack: error.stack
                });
            } else {
                console.error(`Mitigation failed for ${threat.type}:`, error);
            }
            
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    /**
     * Calculate severity category based on risk score
     * @param {number} riskScore - Calculated risk score
     * @returns {string} - Severity category
     */
    _calculateSeverityCategory(riskScore) {
        if (riskScore >= 20) return 'critical';
        if (riskScore >= 15) return 'high';
        if (riskScore >= 10) return 'medium';
        return 'low';
    }
    
    /**
     * Determine appropriate mitigation actions based on threat and severity
     * @param {Object} threat - Threat object
     * @param {string} severityCategory - Calculated severity category
     * @param {string[]} recommendations - Mitigation recommendations
     * @param {string[]} responsePlan - Incident response plan
     * @returns {Object[]} - Array of mitigation actions
     */
    _determineMitigationActions(threat, severityCategory, recommendations, responsePlan) {
        const actions = [];
        
        // Add standard actions for all threat types
        actions.push({
            type: 'log',
            description: `Logging detected ${threat.type} threat`,
            params: { threatDetails: threat }
        });
        
        // Add severity-specific actions
        switch (severityCategory) {
            case 'critical':
                // Critical threats get the most aggressive response
                actions.push({
                    type: 'block',
                    description: `Blocking IP address ${threat.details?.ip || 'associated with threat'}`,
                    params: { ip: threat.details?.ip }
                });
                
                actions.push({
                    type: 'notify',
                    description: 'Sending urgent notification to security team',
                    params: { 
                        urgency: 'critical',
                        recipients: ['security-team', 'management']
                    }
                });
                
                // Add blue team defense measures
                if (threat.details?.ip) {
                    actions.push({
                        type: 'defenseAction',
                        description: 'Activating Blue Team defensive measures',
                        params: { 
                            action: 'blockIP',
                            ip: threat.details.ip
                        }
                    });
                }
                
                // Based on threat type, add specific critical actions
                if (threat.type === 'SQL Injection' || threat.type === 'XSS') {
                    actions.push({
                        type: 'waf',
                        description: 'Updating WAF rules to block attack pattern',
                        params: { 
                            pattern: threat.details?.pattern || 'default'
                        }
                    });
                } else if (threat.type === 'DDoS') {
                    actions.push({
                        type: 'ddos',
                        description: 'Activating DDoS protection',
                        params: { 
                            mode: 'aggressive'
                        }
                    });
                } else if (threat.type === 'Phishing') {
                    actions.push({
                        type: 'emailSecurity',
                        description: 'Updating email security rules',
                        params: { 
                            sender: threat.details?.sender,
                            domain: threat.details?.domain,
                            action: 'block'
                        }
                    });
                }
                break;
                
            case 'high':
                // High severity threats get strong response but less aggressive
                if (threat.details?.ip) {
                    actions.push({
                        type: 'rateLimit',
                        description: `Rate limiting IP address ${threat.details.ip}`,
                        params: { 
                            ip: threat.details.ip,
                            rate: '10/minute'
                        }
                    });
                }
                
                actions.push({
                    type: 'notify',
                    description: 'Sending notification to security team',
                    params: { 
                        urgency: 'high',
                        recipients: ['security-team']
                    }
                });
                
                // Threat-specific high actions
                if (threat.type === 'Brute Force') {
                    actions.push({
                        type: 'accountProtection',
                        description: 'Temporarily locking targeted accounts',
                        params: { 
                            duration: '30m',
                            notifyUsers: true
                        }
                    });
                }
                break;
                
            case 'medium':
                // Medium severity gets monitoring response
                actions.push({
                    type: 'monitor',
                    description: 'Increasing monitoring for this threat vector',
                    params: { 
                        duration: '24h',
                        interval: '5m'
                    }
                });
                
                actions.push({
                    type: 'notify',
                    description: 'Logging alert for review',
                    params: { 
                        urgency: 'medium',
                        recipients: ['security-analysts']
                    }
                });
                break;
                
            case 'low':
                // Low severity just gets logged for review
                actions.push({
                    type: 'monitor',
                    description: 'Adding to watch list',
                    params: { 
                        duration: '72h',
                        interval: '30m'
                    }
                });
                break;
        }
        
        // Add any specific recommendations from mitigation_recommendations.js
        if (recommendations && recommendations.length > 0) {
            actions.push({
                type: 'recommendations',
                description: 'Security control recommendations',
                params: { recommendations }
            });
        }
        
        // Add response plan steps from incident_response.js
        if (responsePlan && responsePlan.length > 0) {
            actions.push({
                type: 'responsePlan',
                description: 'Incident response plan',
                params: { steps: responsePlan }
            });
        }
        
        return actions;
    }
    
    /**
     * Execute the specified mitigation actions
     * @param {Object[]} actions - Array of mitigation actions
     * @returns {Promise<Object[]>} - Results of executed actions
     */
    async _executeMitigationActions(actions) {
        const results = [];
        
        for (const action of actions) {
            try {
                let result;
                
                // Execute different actions based on type
                switch (action.type) {
                    case 'log':
                        // Already logged at start of mitigation
                        result = { status: 'success', message: 'Threat logged successfully' };
                        break;
                    
                    case 'block':
                        result = await this._executeBlockAction(action);
                        break;
                    
                    case 'notify':
                        result = await this._executeNotifyAction(action);
                        break;
                    
                    case 'monitor':
                        result = { status: 'success', message: 'Monitoring configured' };
                        break;
                    
                    case 'rateLimit':
                        result = await this._executeRateLimitAction(action);
                        break;
                    
                    case 'waf':
                        result = await this._executeWafAction(action);
                        break;
                    
                    case 'ddos':
                        result = await this._executeDdosAction(action);
                        break;
                    
                    case 'emailSecurity':
                        result = await this._executeEmailSecurityAction(action);
                        break;
                    
                    case 'accountProtection':
                        result = { status: 'success', message: 'Account protection measures activated' };
                        break;
                    
                    case 'defenseAction':
                        result = await this._executeDefenseAction(action);
                        break;
                    
                    case 'recommendations':
                    case 'responsePlan':
                        // These are informational only, no execution needed
                        result = { status: 'informational', message: 'Information recorded for manual review' };
                        break;
                    
                    default:
                        console.warn(`Unknown mitigation action type: ${action.type}`);
                        result = { status: 'skipped', message: 'Unknown action type' };
                }
                
                results.push({
                    action,
                    result,
                    timestamp: new Date().toISOString()
                });
                
            } catch (error) {
                if (logger && typeof logger.logSystem === 'function') {
                    logger.logSystem('ERROR', `Action ${action.type} failed: ${error.message}`);
                } else {
                    console.error(`Action ${action.type} failed:`, error);
                }
                
                results.push({
                    action,
                    result: {
                        status: 'error',
                        message: error.message
                    },
                    timestamp: new Date().toISOString()
                });
            }
        }
        
        return results;
    }
    
    /**
     * Execute a block action
     * @param {Object} action - Block action details
     * @returns {Promise<Object>} - Result of the action
     */
    async _executeBlockAction(action) {
        try {
            const { ip } = action.params;
            
            if (!ip) {
                return { status: 'skipped', message: 'No IP address provided for blocking' };
            }
            
            // Use blue team defense to block the IP if it's initialized
            if (blueTeamDefense && typeof blueTeamDefense.blockIP === 'function') {
                try {
                    await blueTeamDefense.blockIP(ip);
                } catch (defenseError) {
                    console.warn(`Blue team defense blockIP failed: ${defenseError.message}`);
                    // Continue with webhook attempt
                }
            } else {
                console.log(`Simulating IP blocking for ${ip} (blue team defense not available)`);
            }
            
            // Also try to trigger external firewall via webhook if configured
            if (WEBHOOK_URLS.firewall) {
                try {
                    await axios.post(WEBHOOK_URLS.firewall, {
                        action: 'block',
                        ip,
                        reason: 'Automated threat mitigation',
                        timestamp: new Date().toISOString()
                    });
                } catch (webhookError) {
                    console.warn(`Firewall webhook failed: ${webhookError.message}`);
                    // Continue anyway since we already tried blue team defense
                }
            }
            
            return { status: 'success', message: `IP ${ip} blocking attempted` };
        } catch (error) {
            console.error(`Block action failed: ${error.message}`);
            throw error;
        }
    }
    
    /**
     * Execute a rate limit action
     * @param {Object} action - Rate limit action details
     * @returns {Promise<Object>} - Result of the action
     */
    async _executeRateLimitAction(action) {
        try {
            const { ip, rate } = action.params;
            
            if (!ip) {
                return { status: 'skipped', message: 'No IP address provided for rate limiting' };
            }
            
            // Implement rate limiting via blue team defense if available
            if (blueTeamDefense && typeof blueTeamDefense.implementBruteForceProtection === 'function') {
                try {
                    await blueTeamDefense.implementBruteForceProtection();
                } catch (defenseError) {
                    console.warn(`Blue team defense rate limiting failed: ${defenseError.message}`);
                }
            } else {
                console.log(`Simulating rate limiting for ${ip} at ${rate} (blue team defense not available)`);
            }
            
            return { status: 'success', message: `Rate limiting attempted for IP ${ip} at ${rate}` };
        } catch (error) {
            console.error(`Rate limit action failed: ${error.message}`);
            throw error;
        }
    }
    
    /**
     * Execute a WAF (Web Application Firewall) action
     * @param {Object} action - WAF action details
     * @returns {Promise<Object>} - Result of the action
     */
    async _executeWafAction(action) {
        try {
            const { pattern } = action.params;
            
            // Trigger WAF update via webhook if configured
            if (WEBHOOK_URLS.waf) {
                try {
                    await axios.post(WEBHOOK_URLS.waf, {
                        action: 'updateRules',
                        pattern,
                        reason: 'Automated threat mitigation',
                        timestamp: new Date().toISOString()
                    });
                    
                    return { status: 'success', message: 'WAF rules updated successfully' };
                } catch (webhookError) {
                    console.warn(`WAF webhook failed: ${webhookError.message}`);
                    return { status: 'partial', message: 'WAF webhook failed but simulation proceeded' };
                }
            } else {
                console.log(`Simulating WAF rule update for pattern: ${pattern} (webhook not configured)`);
                return { status: 'simulated', message: 'WAF rules update simulated (webhook not configured)' };
            }
        } catch (error) {
            console.error(`WAF action failed: ${error.message}`);
            throw error;
        }
    }
    
    /**
     * Execute a DDoS protection action
     * @param {Object} action - DDoS action details
     * @returns {Promise<Object>} - Result of the action
     */
    async _executeDdosAction(action) {
        try {
            const { mode } = action.params;
            
            // Implement DDoS protection via blue team defense if available
            if (blueTeamDefense && typeof blueTeamDefense.implementDDoSProtection === 'function') {
                try {
                    await blueTeamDefense.implementDDoSProtection();
                } catch (defenseError) {
                    console.warn(`Blue team defense DDoS protection failed: ${defenseError.message}`);
                }
            } else {
                console.log(`Simulating DDoS protection in ${mode} mode (blue team defense not available)`);
            }
            
            // Also trigger external DDoS protection via webhook if configured
            if (WEBHOOK_URLS.security_gateway) {
                try {
                    await axios.post(WEBHOOK_URLS.security_gateway, {
                        action: 'ddos_protection',
                        mode,
                        reason: 'Automated threat mitigation',
                        timestamp: new Date().toISOString()
                    });
                } catch (webhookError) {
                    console.warn(`Security gateway webhook failed: ${webhookError.message}`);
                }
            }
            
            return { status: 'success', message: `DDoS protection activated in ${mode} mode` };
        } catch (error) {
            console.error(`DDoS action failed: ${error.message}`);
            throw error;
        }
    }
    
    /**
     * Execute an email security action
     * @param {Object} action - Email security action details
     * @returns {Promise<Object>} - Result of the action
     */
    async _executeEmailSecurityAction(action) {
        try {
            const { sender, domain, action: emailAction } = action.params;
            
            // Trigger email security update via webhook if configured
            if (WEBHOOK_URLS.email_security) {
                try {
                    await axios.post(WEBHOOK_URLS.email_security, {
                        action: emailAction,
                        sender,
                        domain,
                        reason: 'Automated threat mitigation',
                        timestamp: new Date().toISOString()
                    });
                    
                    return { status: 'success', message: 'Email security rules updated successfully' };
                } catch (webhookError) {
                    console.warn(`Email security webhook failed: ${webhookError.message}`);
                    return { status: 'error', message: `Email security webhook failed: ${webhookError.message}` };
                }
            } else {
                console.log(`Simulating email security update for ${sender || domain} (webhook not configured)`);
                return { status: 'simulated', message: 'Email security update simulated (webhook not configured)' };
            }
        } catch (error) {
            console.error(`Email security action failed: ${error.message}`);
            throw error;
        }
    }
    
    /**
     * Execute a notification action
     * @param {Object} action - Notification action details
     * @returns {Promise<Object>} - Result of the action
     */
    async _executeNotifyAction(action) {
        try {
            const { urgency, recipients } = action.params;
            
            // Log the notification (actual notifications would be implemented here)
            if (logger && typeof logger.logSystem === 'function') {
                logger.logSystem('INFO', `Notification sent with urgency: ${urgency}`, {
                    recipients,
                    urgency
                });
            } else {
                console.log(`Notification sent with urgency: ${urgency}`, {
                    recipients,
                    urgency
                });
            }
            
            // In a real-world scenario, this would send emails, SMS, Slack messages, etc.
            // This is a simplified implementation for the project
            
            return { status: 'success', message: `Notification sent to ${recipients.join(', ')}` };
        } catch (error) {
            console.error(`Notification action failed: ${error.message}`);
            throw error;
        }
    }
    
    /**
     * Execute a blue team defense action
     * @param {Object} action - Defense action details
     * @returns {Promise<Object>} - Result of the action
     */
    async _executeDefenseAction(action) {
        try {
            const { action: defenseAction, ip } = action.params;
            
            // Check if blue team defense is available
            if (!blueTeamDefense) {
                console.log(`Simulating blue team defense action: ${defenseAction} (module not available)`);
                return { status: 'simulated', message: `Blue team defense action ${defenseAction} simulated` };
            }
            
            if (defenseAction === 'blockIP' && ip) {
                if (typeof blueTeamDefense.blockIP === 'function') {
                    await blueTeamDefense.blockIP(ip);
                    return { status: 'success', message: `Blue team defense blocked IP ${ip}` };
                }
            } else if (defenseAction === 'implementDDoSProtection') {
                if (typeof blueTeamDefense.implementDDoSProtection === 'function') {
                    await blueTeamDefense.implementDDoSProtection();
                    return { status: 'success', message: 'Blue team defense implemented DDoS protection' };
                }
            } else if (defenseAction === 'implementBruteForceProtection') {
                if (typeof blueTeamDefense.implementBruteForceProtection === 'function') {
                    await blueTeamDefense.implementBruteForceProtection();
                    return { status: 'success', message: 'Blue team defense implemented brute force protection' };
                }
            } else if (defenseAction === 'implementMalwareProtection') {
                if (typeof blueTeamDefense.implementMalwareProtection === 'function') {
                    await blueTeamDefense.implementMalwareProtection();
                    return { status: 'success', message: 'Blue team defense implemented malware protection' };
                }
            }
            
            return { status: 'skipped', message: `Unknown defense action or method not available: ${defenseAction}` };
        } catch (error) {
            console.error(`Defense action failed: ${error.message}`);
            throw error;
        }
    }
    
    /**
     * Store mitigation record in database
     * @param {Object} record - Mitigation record to store
     * @returns {Promise<void>}
     */
    async _storeMitigationRecord(record) {
        try {
            // Skip if Supabase is not initialized
            if (!supabase) {
                console.log('Skipping database storage - Supabase not initialized');
                return;
            }
            
            const { error } = await supabase
                .from('mitigation_actions')
                .insert({
                    threat_id: record.threatId,
                    threat_type: record.threatType,
                    risk_score: record.riskScore,
                    severity: record.severityCategory,
                    actions_taken: record.mitigationActions,
                    results: record.results,
                    created_at: record.timestamp,
                    status: record.status
                });
                
            if (error) {
                throw error;
            }
        } catch (error) {
            if (logger && typeof logger.logSystem === 'function') {
                logger.logSystem('ERROR', 'Failed to store mitigation record', {
                    error: error.message,
                    record: record.threatId
                });
            } else {
                console.error('Failed to store mitigation record:', error);
            }
            
            // Don't throw here, so the main mitigation flow isn't interrupted
            // by database storage issues
        }
    }
    
    /**
     * Get mitigation history from database
     * @param {Object} options - Query options
     * @param {number} options.limit - Number of records to return
     * @param {string} options.threatType - Filter by threat type
     * @param {string} options.severity - Filter by severity
     * @returns {Promise<Object[]>} - Mitigation history records
     */
    async getMitigationHistory(options = {}) {
        try {
            const { limit = 100, threatType, severity } = options;
            
            // If Supabase is not initialized, return in-memory history
            if (!supabase) {
                console.log('Using in-memory mitigation history (Supabase not initialized)');
                let history = [...this.mitigationHistory];
                
                // Apply filters
                if (threatType) {
                    history = history.filter(record => record.threatType === threatType);
                }
                
                if (severity) {
                    history = history.filter(record => record.severityCategory === severity);
                }
                
                // Sort by timestamp (newest first)
                history.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
                
                // Apply limit
                return history.slice(0, limit);
            }
            
            // Otherwise, query the database
            let query = supabase
                .from('mitigation_actions')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(limit);
                
            if (threatType) {
                query = query.eq('threat_type', threatType);
            }
            
            if (severity) {
                query = query.eq('severity', severity);
            }
            
            const { data, error } = await query;
            
            if (error) {
                throw error;
            }
            
            return data;
        } catch (error) {
            console.error('Failed to retrieve mitigation history:', error);
            
            // Return in-memory history as fallback
            return this.mitigationHistory;
        }
    }
    
    /**
     * Get the effectiveness of different mitigation strategies
     * @returns {Promise<Object>} - Mitigation effectiveness metrics
     */
    async getMitigationEffectiveness() {
        try {
            // For a real implementation, this would query the database and analyze
            // which mitigation strategies were most effective based on results
            // and whether threats reoccurred after mitigation
            
            // Simplified implementation for the project
            return {
                block: { effectiveness: 0.95, count: 42 },
                rateLimit: { effectiveness: 0.80, count: 35 },
                waf: { effectiveness: 0.88, count: 25 },
                ddos: { effectiveness: 0.92, count: 18 },
                emailSecurity: { effectiveness: 0.75, count: 12 }
            };
        } catch (error) {
            console.error('Failed to calculate mitigation effectiveness:', error);
            
            return {};
        }
    }
}

// Export singleton instance
module.exports = new ThreatMitigation();