
const { createClient } = require('@supabase/supabase-js');
const { fetchShodanData } = require("./shodan");
import { handleThreat } from '../src/backend/alerts.js';

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Fetches threat intelligence data from Shodan and stores it in Supabase
 * @param {string} ip - The IP address to analyze
 */
async function fetchAndStoreShodanData(ip) {
    try {
        console.log(`Fetching Shodan data for IP: ${ip}`);

        // Fetch threat data from Shodan
        const shodanData = await fetchShodanData(ip);

        if (!shodanData || !shodanData.ports) {
            console.error("No relevant threat data found from Shodan.");
            return;
        }

        // Extract data from Shodan response
        const ports = shodanData.ports || [];
        const hostnames = shodanData.hostnames || [];
        
        // Create services object
        const services = {};
        if (shodanData.data) {
            shodanData.data.forEach(service => {
                if (service.port && service.transport) {
                    services[service.port] = service.transport;
                }
            });
        }
        
        // Extract vulnerabilities if they exist
        const vulns = shodanData.vulns || {};

        // Store in threat_data table
        const { data: threatData, error: threatError } = await supabase
            .from('threat_data')
            .upsert({
                ip_address: ip,
                ports: ports,
                services: services,
                hostnames: hostnames,
                vulns: vulns,
                last_scan: new Date().toISOString(),
                raw_data: shodanData
            })
            .select();

        if (threatError) {
            throw new Error(`Error storing threat data: ${threatError.message}`);
        }

        console.log("Shodan threat data stored successfully");

        // Process vulnerabilities if present
        if (Object.keys(vulns).length > 0) {
            await processVulnerabilities(ip, vulns);
        }

        return threatData;
    } catch (error) {
        console.error("Error storing Shodan threat data:", error.message);
        throw error;
    }
}

/**
 * Processes vulnerabilities found in Shodan data
 * @param {string} ip - The IP address
 * @param {object} vulns - Vulnerability data from Shodan
 */
async function processVulnerabilities(ip, vulns) {
    try {
        // Find assets with this IP (example query - customize as needed)
        const { data: assets } = await supabase
            .from('assets')
            .select('*')
            .ilike('description', `%${ip}%`);

        if (!assets || assets.length === 0) {
            console.log(`No assets found with IP ${ip}. Creating generic asset.`);
            
            // Create a generic asset for this IP if none exists
            const { data: newAsset, error: assetError } = await supabase
                .from('assets')
                .insert({
                    asset_name: `Server at ${ip}`,
                    asset_type: 'Hardware',
                    description: `Discovered server at IP ${ip}`,
                    criticality: 3
                })
                .select()
                .single();
                
            if (assetError) {
                throw new Error(`Error creating asset: ${assetError.message}`);
            }
            
            let assets = await supabase
                .from('assets')
                .select('*')
                .ilike('description', `%${ip}%`);
        }

        // Process each vulnerability
        for (const [cveId, vulnInfo] of Object.entries(vulns)) {
            // Check if vulnerability exists
            const { data: existingVuln } = await supabase
                .from('vulnerabilities')
                .select('id')
                .eq('cve_id', cveId)
                .single();

            let vulnId;
            if (!existingVuln) {
                // Create new vulnerability
                const { data: newVuln, error: vulnError } = await supabase
                    .from('vulnerabilities')
                    .insert({
                        vulnerability_name: `CVE: ${cveId}`,
                        description: vulnInfo.summary || 'No description available',
                        cve_id: cveId,
                        severity: Math.round(vulnInfo.cvss || 5)
                    })
                    .select('id')
                    .single();

                if (vulnError) {
                    throw new Error(`Error creating vulnerability: ${vulnError.message}`);
                }
                
                vulnId = newVuln.id;
            } else {
                vulnId = existingVuln.id;
            }

            // Create or get a threat related to this vulnerability
            const { data: threats } = await supabase
                .from('threats')
                .select('id')
                .eq('threat_name', 'Vulnerability Exploitation')
                .limit(1);

            let threatId;
            if (!threats || threats.length === 0) {
                const { data: newThreat, error: threatError } = await supabase
                    .from('threats')
                    .insert({
                        threat_name: 'Vulnerability Exploitation',
                        threat_type: 'Vulnerability',
                        description: 'Exploitation of known vulnerabilities'
                    })
                    .select('id')
                    .single();

                if (threatError) {
                    throw new Error(`Error creating threat: ${threatError.message}`);
                }
                
                threatId = newThreat.id;
            } else {
                threatId = threats[0].id;
            }

            // Create TVA mapping for each asset
            for (const asset of assets) {
                // Calculate likelihood based on vulnerability severity
                const severity = Math.round(vulnInfo.cvss || 5);
                const likelihood = Math.min(5, Math.ceil(severity / 2));
                
                // Impact depends on asset criticality
                const impact = asset.criticality || 3;
                
                // Insert or update TVA mapping
                const { error: tvaError } = await supabase
                    .from('tva_mapping')
                    .upsert({
                        asset_id: asset.id,
                        threat_id: threatId,
                        vulnerability_id: vulnId,
                        likelihood: likelihood,
                        impact: impact,
                        last_updated: new Date().toISOString()
                    });

                if (tvaError) {
                    throw new Error(`Error creating TVA mapping: ${tvaError.message}`);
                }

                // Handle the threat based on risk score
                const riskScore = likelihood * impact;
                if (riskScore > 20) {
                    handleThreat({
                        name: `High-Risk Vulnerability: ${cveId}`,
                        riskScore: riskScore,
                    });
                }


            }
        }
        
        console.log(`Processed ${Object.keys(vulns).length} vulnerabilities for IP ${ip}`);
    } catch (error) {
        console.error("Error processing vulnerabilities:", error.message);
    }
}

module.exports = { fetchAndStoreShodanData };

