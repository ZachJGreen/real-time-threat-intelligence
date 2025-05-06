/**
 * Utility functions for CSV report generation
 * Links to backend report_generator.js functionality
 */

/**
 * Get CSV field definitions with headers
 * @returns {Object} CSV field mapping
 */
export const getCSVFields = () => {
    return {
      'threat_name': 'Threat Name',
      'asset_name': 'Asset Name',
      'asset_type': 'Asset Type',
      'vulnerability_name': 'Vulnerability',
      'cve_id': 'CVE ID',
      'likelihood': 'Likelihood (1-5)',
      'impact': 'Impact (1-5)',
      'risk_score': 'Risk Score',
      'detection_date': 'Detection Date',
      'status': 'Risk Level',
      'mitigation_status': 'Mitigation Status',
      'recommended_actions': 'Recommended Actions'
    };
  };
  
  /**
   * Prepare threat data for CSV export
   * @param {Array} threats - Array of threat objects
   * @returns {Array} Enhanced threat data for CSV
   */
  export const prepareCSVData = (threats) => {
    if (!Array.isArray(threats)) {
      return [];
    }
  
    return threats.map(threat => {
      // Get asset type from asset name
      const assetType = determineAssetType(threat.asset_name);
      
      // Determine risk status based on score
      const riskStatus = getRiskStatus(threat.risk_score);
      
      // Get recommended actions based on threat type
      const recommendedActions = getRecommendedActions(threat.threat_name);
      
      // Get mitigation status based on risk score
      const mitigationStatus = getMitigationStatus(threat.risk_score);
  
      // Format the detection date
      const detectionDate = formatDate(threat.last_updated || threat.created_at || new Date());
  
      // Return enhanced data
      return {
        threat_name: threat.threat_name || 'Unknown Threat',
        asset_name: threat.asset_name || 'Unknown Asset',
        asset_type: assetType,
        vulnerability_name: threat.vulnerability_name || 'Unknown Vulnerability',
        cve_id: threat.cve_id || 'N/A',
        likelihood: threat.likelihood || 'N/A',
        impact: threat.impact || 'N/A',
        risk_score: threat.risk_score || 0,
        detection_date: detectionDate,
        status: riskStatus,
        mitigation_status: mitigationStatus,
        recommended_actions: recommendedActions
      };
    });
  };
  
  /**
   * Determine asset type based on asset name
   * @param {string} assetName - Name of the asset
   * @returns {string} Determined asset type
   */
  function determineAssetType(assetName) {
    if (!assetName) return 'Unknown';
    
    const name = assetName.toLowerCase();
    
    if (name.includes('server') || name.includes('device') || 
        name.includes('hardware') || name.includes('router')) {
      return 'Hardware';
    }
    if (name.includes('database') || name.includes('data') || 
        name.includes('records')) {
      return 'Data';
    }
    if (name.includes('app') || name.includes('software') || 
        name.includes('system') || name.includes('api')) {
      return 'Software';
    }
    if (name.includes('user') || name.includes('employee') || 
        name.includes('admin') || name.includes('staff')) {
      return 'People';
    }
    if (name.includes('process') || name.includes('workflow') || 
        name.includes('procedure')) {
      return 'Process';
    }
    
    return 'Asset';
  }
  
  /**
   * Get risk status based on risk score
   * @param {number} score - Risk score
   * @returns {string} Risk status
   */
  function getRiskStatus(score) {
    if (score >= 20) return 'Critical';
    if (score >= 15) return 'High';
    if (score >= 10) return 'Medium';
    return 'Low';
  }
  
  /**
   * Get mitigation status based on risk score
   * @param {number} score - Risk score
   * @returns {string} Mitigation status
   */
  function getMitigationStatus(score) {
    if (score >= 15) return 'Immediate Action Required';
    if (score >= 10) return 'Action Recommended';
    return 'Monitor';
  }
  
  /**
   * Get recommended actions based on threat type
   * @param {string} threatType - Type of threat
   * @returns {string} Recommended actions
   */
  function getRecommendedActions(threatType) {
    if (!threatType) return 'Evaluate security posture';
    
    const recommendations = {
      'SQL Injection': 'Implement parameterized queries, validate inputs, deploy WAF',
      'Cross-Site Scripting': 'Validate and encode outputs, use Content-Security-Policy',
      'Phishing': 'Train employees, implement email filtering, enforce 2FA',
      'DDoS Attack': 'Deploy DDoS protection, implement rate limiting',
      'Brute Force': 'Implement account lockout, use strong password policy, enable 2FA',
      'Malware': 'Update antivirus, restrict permissions, scan systems regularly',
      'Vulnerability Exploitation': 'Apply security patches, update software, conduct regular vulnerability scanning',
      'Insider Threat': 'Implement least privilege access, conduct security awareness training, monitor access logs',
      'Man-in-the-Middle': 'Use TLS/SSL, implement certificate pinning, use secure protocols',
      'Ransomware': 'Maintain regular backups, keep systems updated, use anti-ransomware solutions'
    };
    
    // Check for partial matches if exact match not found
    for (const [key, value] of Object.entries(recommendations)) {
      if (threatType.includes(key)) {
        return value;
      }
    }
    
    return 'Evaluate and implement appropriate security controls';
  }
  
  /**
   * Format date for reports
   * @param {string|Date} dateInput - Date to format
   * @returns {string} Formatted date
   */
  function formatDate(dateInput) {
    if (!dateInput) return 'N/A';
    
    try {
      const date = new Date(dateInput);
      if (isNaN(date.getTime())) return 'N/A';
      
      return date.toISOString().split('T')[0]; // YYYY-MM-DD format
    } catch (error) {
      return 'N/A';
    }
  }