const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const config = require('./config');

// Initialize Supabase client
const supabase = createClient(config.SUPABASE_URL, config.SUPABASE_KEY);

class BlueTeamDefense {
    constructor() {
        this.firewallRules = new Map();
        this.securityConfigs = new Map();
        this.blockedIPs = new Set();
    }

    /**
     * Automatically update firewall rules based on threat intelligence
     * @param {Object} threatData - Threat intelligence data
     */
    async updateFirewallRules(threatData) {
        try {
            const { ip, threatType, severity } = threatData;
            
            // Block malicious IPs
            if (severity >= 7) {
                await this.blockIP(ip);
            }

            // Update firewall rules based on threat type
            switch (threatType) {
                case 'DDoS':
                    await this.implementDDoSProtection();
                    break;
                case 'BruteForce':
                    await this.implementBruteForceProtection();
                    break;
                case 'Malware':
                    await this.implementMalwareProtection();
                    break;
            }

            // Log the action
            await this.logDefensiveAction('firewall_update', threatData);
        } catch (error) {
            console.error('Error updating firewall rules:', error);
            throw error;
        }
    }

    /**
     * Block a specific IP address
     * @param {string} ip - IP address to block
     */
    async blockIP(ip) {
        if (this.blockedIPs.has(ip)) return;

        try {
            // Windows firewall rule (using PowerShell)
            const command = `New-NetFirewallRule -DisplayName "Block_${ip}" -Direction Inbound -Action Block -RemoteAddress ${ip}`;
            await this.executeCommand(command);

            this.blockedIPs.add(ip);
            await this.logDefensiveAction('ip_block', { ip });
        } catch (error) {
            console.error(`Error blocking IP ${ip}:`, error);
            throw error;
        }
    }

    /**
     * Implement DDoS protection measures
     */
    async implementDDoSProtection() {
        try {
            // Rate limiting rules
            const commands = [
                'New-NetFirewallRule -DisplayName "DDoS_Protection" -Direction Inbound -Action Block -Protocol TCP -LocalPort 80,443 -RemoteAddress Any -RateLimit 1000',
                'New-NetFirewallRule -DisplayName "DDoS_Protection_UDP" -Direction Inbound -Action Block -Protocol UDP -LocalPort 53,123 -RemoteAddress Any -RateLimit 500'
            ];

            for (const command of commands) {
                await this.executeCommand(command);
            }

            await this.logDefensiveAction('ddos_protection', {});
        } catch (error) {
            console.error('Error implementing DDoS protection:', error);
            throw error;
        }
    }

    /**
     * Implement brute force protection measures
     */
    async implementBruteForceProtection() {
        try {
            const commands = [
                'New-NetFirewallRule -DisplayName "BruteForce_Protection" -Direction Inbound -Action Block -Protocol TCP -LocalPort 22,3389 -RemoteAddress Any -RateLimit 10',
                'New-NetFirewallRule -DisplayName "BruteForce_Protection_Timeout" -Direction Inbound -Action Block -Protocol TCP -LocalPort 22,3389 -RemoteAddress Any -RateLimit 5 -RateLimitTimeout 3600'
            ];

            for (const command of commands) {
                await this.executeCommand(command);
            }

            await this.logDefensiveAction('brute_force_protection', {});
        } catch (error) {
            console.error('Error implementing brute force protection:', error);
            throw error;
        }
    }

    /**
     * Implement malware protection measures
     */
    async implementMalwareProtection() {
        try {
            const commands = [
                'New-NetFirewallRule -DisplayName "Malware_Protection" -Direction Inbound -Action Block -Protocol TCP -LocalPort 445,139 -RemoteAddress Any',
                'New-NetFirewallRule -DisplayName "Malware_Protection_Outbound" -Direction Outbound -Action Block -Protocol TCP -RemotePort 445,139 -RemoteAddress Any'
            ];

            for (const command of commands) {
                await this.executeCommand(command);
            }

            await this.logDefensiveAction('malware_protection', {});
        } catch (error) {
            console.error('Error implementing malware protection:', error);
            throw error;
        }
    }

    /**
     * Execute a PowerShell command
     * @param {string} command - Command to execute
     * @returns {Promise} - Promise that resolves when command completes
     */
    executeCommand(command) {
        return new Promise((resolve, reject) => {
            exec(`powershell.exe -Command "${command}"`, (error, stdout, stderr) => {
                if (error) {
                    reject(error);
                    return;
                }
                resolve(stdout);
            });
        });
    }

    /**
     * Log defensive actions to the database
     * @param {string} actionType - Type of defensive action
     * @param {Object} data - Additional data about the action
     */
    async logDefensiveAction(actionType, data) {
        try {
            const { error } = await supabase
                .from('defensive_actions')
                .insert([
                    {
                        action_type: actionType,
                        data: data,
                        timestamp: new Date().toISOString()
                    }
                ]);

            if (error) throw error;
        } catch (error) {
            console.error('Error logging defensive action:', error);
            throw error;
        }
    }

    /**
     * Get current blocked IPs
     * @returns {Set} - Set of blocked IPs
     */
    getBlockedIPs() {
        return this.blockedIPs;
    }

    /**
     * Get current firewall rules
     * @returns {Map} - Map of firewall rules
     */
    getFirewallRules() {
        return this.firewallRules;
    }
}

module.exports = new BlueTeamDefense(); 