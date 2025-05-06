const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

/**
 * Utility class for generating CSV data from threat information
 */
class ReportGenerator {
  /**
   * Prepares threat data for CSV export with enhanced information
   * @param {Array} threats - Array of threat objects
   * @returns {Array} - Enhanced threat data for CSV export
   */
  static prepareCSVData(threats) {
    if (!Array.isArray(threats)) {
      return [];
    }

    return threats.map(threat => {
      // Get asset type from asset name
      const assetType = this.determineAssetType(threat.asset_name);
      
      // Determine risk status based on score
      const riskStatus = this.getRiskStatus(threat.risk_score);
      
      // Get recommended actions based on threat type
      const recommendedActions = this.getRecommendedActions(threat.threat_name);
      
      // Get mitigation status based on risk score
      const mitigationStatus = this.getMitigationStatus(threat.risk_score);

      // Format the detection date
      const detectionDate = this.formatDate(threat.last_updated || threat.created_at || new Date());

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
  }

  /**
   * Get CSV field definitions with headers
   * @returns {Object} - CSV field mapping
   */
  static getCSVFields() {
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
  }

  /**
   * Determine asset type based on asset name
   * @param {string} assetName - Name of the asset
   * @returns {string} - Determined asset type
   */
  static determineAssetType(assetName) {
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
   * @returns {string} - Risk status
   */
  static getRiskStatus(score) {
    if (score >= 20) return 'Critical';
    if (score >= 15) return 'High';
    if (score >= 10) return 'Medium';
    return 'Low';
  }

  /**
   * Get mitigation status based on risk score
   * @param {number} score - Risk score
   * @returns {string} - Mitigation status
   */
  static getMitigationStatus(score) {
    if (score >= 15) return 'Immediate Action Required';
    if (score >= 10) return 'Action Recommended';
    return 'Monitor';
  }

  /**
   * Get recommended actions based on threat type
   * @param {string} threatType - Type of threat
   * @returns {string} - Recommended actions
   */
  static getRecommendedActions(threatType) {
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
   * @returns {string} - Formatted date
   */
  static formatDate(dateInput) {
    if (!dateInput) return 'N/A';
    
    try {
      const date = new Date(dateInput);
      if (isNaN(date.getTime())) return 'N/A';
      
      return date.toISOString().split('T')[0]; // YYYY-MM-DD format
    } catch (error) {
      return 'N/A';
    }
  }

  /**
   * Generate a PDF report of security threats
   * @param {Array} threats - Array of threat objects
   * @param {Object} options - Configuration options
   * @param {string} [options.outputPath='threat_report.pdf'] - Output file path
   * @param {string} [options.title='Threat Intelligence Report'] - Report title
   * @param {string} [options.company=''] - Company name for the report header
   * @param {Object} [options.colors] - Color scheme for the report
   * @returns {Promise<string>} - Promise resolving to the output file path
   */
  static generateThreatReport(threats, options = {}) {
    return new Promise((resolve, reject) => {
      // Handle default options
      const {
        outputPath = 'threat_report.pdf',
        title = 'Threat Intelligence Report',
        company = '',
        colors = {
          title: '#2c3e50',
          header: '#34495e',
          high: '#e74c3c',
          medium: '#f39c12',
          low: '#27ae60',
          text: '#333333'
        }
      } = options;

      // Validate inputs
      if (!Array.isArray(threats)) {
        return reject(new Error('Threats must be provided as an array'));
      }

      // Ensure output directory exists
      const outputDir = path.dirname(outputPath);
      if (!fs.existsSync(outputDir)) {
        try {
          fs.mkdirSync(outputDir, { recursive: true });
        } catch (err) {
          return reject(new Error(`Failed to create output directory: ${err.message}`));
        }
      }

      // Create PDF document with better margins for text content
      const doc = new PDFDocument({
        margins: { top: 50, bottom: 50, left: 40, right: 40 },
        size: 'letter',
        info: {
          Title: title,
          Author: company || 'Security Team',
          CreationDate: new Date()
        }
      });

      // Handle stream errors
      const fullPath = path.resolve(outputDir, path.basename(outputPath));
      const outputStream = fs.createWriteStream(fullPath);
      
      outputStream.on('error', (err) => {
        reject(new Error(`Failed to write PDF file: ${err.message}`));
      });

      doc.pipe(outputStream);

      try {
        // Add report header
        this._addReportHeader(doc, title, company, colors);

        // Add summary section
        this._addSummarySection(doc, threats, colors);

        // Add threat details
        this._addThreatDetails(doc, threats, colors);

        // Finalize the PDF
        doc.end();

        outputStream.on('finish', () => {
          resolve(fullPath);
          console.log(`✅ Report generated: ${fullPath}`);
        });
      } catch (err) {
        // Clean up and reject promise if an error occurs
        try {
          doc.end();
          if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath);
          }
        } catch (cleanupErr) {
          console.error('Error during cleanup:', cleanupErr);
        }
        reject(new Error(`Failed to generate report: ${err.message}`));
      }
    });
  }

  /**
   * Add the report header section to the PDF
   * @private
   */
  static _addReportHeader(doc, title, company, colors) {
    // Add logo placeholder if needed
    // doc.image('logo.png', 50, 45, { width: 50 });

    // Add title
    doc.fontSize(24)
      .fillColor(colors.title)
      .text(title, { align: 'center' });

    if (company) {
      doc.fontSize(12)
        .fillColor(colors.header)
        .text(company, { align: 'center' });
    }

    // Add date
    const today = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    doc.moveDown(0.5)
      .fontSize(10)
      .fillColor(colors.text)
      .text(`Generated on: ${today}`, { align: 'center' });

    doc.moveDown(2);
  }

  /**
   * Add a summary section with threat statistics
   * @private
   */
  static _addSummarySection(doc, threats, colors) {
    // Calculate page width for better spacing
    const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;

    // Count threats by risk level
    const highRisks = threats.filter(t => t.risk_score >= 15).length;
    const mediumRisks = threats.filter(t => t.risk_score >= 8 && t.risk_score < 15).length;
    const lowRisks = threats.filter(t => t.risk_score < 8).length;

    doc.fontSize(14)
      .fillColor(colors.header)
      .text('Threat Summary', { underline: true });

    doc.moveDown(1);

    doc.fontSize(10)
      .fillColor(colors.text)
      .text(`Total Threats: ${threats.length}`);

    doc.fillColor(colors.high)
      .text(`High Risk Threats: ${highRisks}`);

    doc.fillColor(colors.medium)
      .text(`Medium Risk Threats: ${mediumRisks}`);

    doc.fillColor(colors.low)
      .text(`Low Risk Threats: ${lowRisks}`);

    doc.moveDown(2);
  }

  /**
   * Add detailed information for each threat
   * @private
   */
  static _addThreatDetails(doc, threats, colors) {
    // Calculate usable page width (accounting for margins)
    const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;

    // Define column widths (adjusted for better text fitting)
    const colWidths = {
      name: Math.floor(pageWidth * 0.28),
      score: Math.floor(pageWidth * 0.10),
      cve: Math.floor(pageWidth * 0.22),
      asset: Math.floor(pageWidth * 0.35)
    };

    // Sort threats by risk score (highest first)
    const sortedThreats = [...threats].sort((a, b) => b.risk_score - a.risk_score);

    doc.fontSize(14)
      .fillColor(colors.header)
      .text('Detailed Threat Analysis', { underline: true });

    doc.moveDown(1);

    // Get starting positions
    const startY = doc.y;
    const startX = doc.x;

    // Draw header row
    doc.fontSize(10)
      .fillColor(colors.header);

    doc.text('Threat Name', startX, startY, { width: colWidths.name, continued: false });
    doc.text('Risk Score', startX + colWidths.name + 5, startY, { width: colWidths.score, continued: false });
    doc.text('CVE ID', startX + colWidths.name + colWidths.score + 10, startY, { width: colWidths.cve, continued: false });
    doc.text('Affected Asset', startX + colWidths.name + colWidths.score + colWidths.cve + 15, startY, { width: colWidths.asset, continued: false });

    doc.moveDown(0.5);

    // Draw a line under header
    const lineY = doc.y;
    doc.moveTo(startX, lineY)
      .lineTo(startX + pageWidth, lineY)
      .stroke();

    doc.moveDown(0.8);

    // Track position to avoid text overflow
    let currentY = doc.y;

    // Add each threat
    sortedThreats.forEach((threat, index) => {
      // Check if we need a new page - leave enough room for threat details and description
      if (currentY > doc.page.height - 120) {
        doc.addPage();
        currentY = doc.page.margins.top + 30;
        doc.y = currentY;
      }

      // Set color based on risk score
      let textColor = colors.low;
      if (threat.risk_score >= 15) {
        textColor = colors.high;
      } else if (threat.risk_score >= 8) {
        textColor = colors.medium;
      }

      // Main threat data row with improved positioning
      const rowY = doc.y;

      // Threat name column
      doc.fillColor(textColor)
        .fontSize(10)
        .text(threat.threat_name || 'Unknown Threat',
          startX, rowY,
          { width: colWidths.name, continued: false });

      // Risk score column
      doc.text(threat.risk_score.toString(),
        startX + colWidths.name + 5, rowY,
        { width: colWidths.score, continued: false, align: 'left' });

      // CVE ID column
      doc.text(threat.cve_id || 'N/A',
        startX + colWidths.name + colWidths.score + 10, rowY,
        { width: colWidths.cve, continued: false });

      // Asset name column
      doc.text(threat.asset_name || 'Unknown',
        startX + colWidths.name + colWidths.score + colWidths.cve + 15, rowY,
        { width: colWidths.asset, continued: false });

      // Update position
      doc.moveDown(1.2);
      currentY = doc.y;

      // Add description if available - using full width
      if (threat.description) {
        doc.fillColor(colors.text)
          .fontSize(9)
          .text(threat.description,
            { indent: 10, width: pageWidth - 20, align: 'left' });

        doc.moveDown(1);
        currentY = doc.y;
      }

      // Add light separator line between threats
      if (index < sortedThreats.length - 1) {
        doc.strokeColor('#e0e0e0')
          .moveTo(startX + 10, currentY - 5)
          .lineTo(startX + pageWidth - 10, currentY - 5)
          .dash(3, { space: 2 })
          .stroke();

        doc.moveDown(0.8);
        currentY = doc.y;
        doc.undash(); // Reset dash pattern
      }
    });
  }

  /**
   * Export threats data to JSON format
   * @param {Array} threats - Array of threat objects
   * @param {string} outputPath - Path to save the JSON file
   * @returns {Promise<string>} - Promise resolving to the output file path
   */
  static exportToJSON(threats, outputPath) {
    return new Promise((resolve, reject) => {
      try {
        // Prepare enhanced data
        const enhancedData = this.prepareCSVData(threats);
        
        // Convert to JSON
        const jsonData = JSON.stringify(enhancedData, null, 2);
        
        // Ensure output directory exists
        const outputDir = path.dirname(outputPath);
        if (!fs.existsSync(outputDir)) {
          fs.mkdirSync(outputDir, { recursive: true });
        }
        
        // Write to file
        fs.writeFileSync(outputPath, jsonData);
        
        resolve(outputPath);
      } catch (error) {
        reject(new Error(`Failed to export JSON: ${error.message}`));
      }
    });
  }

  /**
   * Export threats data to CSV format
   * @param {Array} threats - Array of threat objects
   * @param {string} outputPath - Path to save the CSV file
   * @returns {Promise<string>} - Promise resolving to the output file path
   */
  static exportToCSV(threats, outputPath) {
    return new Promise((resolve, reject) => {
      try {
        // Prepare enhanced data
        const enhancedData = this.prepareCSVData(threats);
        
        // Get field definitions
        const fields = this.getCSVFields();
        
        // Convert to CSV
        const headers = Object.values(fields).join(',');
        const rows = enhancedData.map(item => {
          return Object.keys(fields).map(key => {
            // Properly escape CSV values
            const value = item[key]?.toString() || '';
            return `"${value.replace(/"/g, '""')}"`;
          }).join(',');
        });
        
        const csvContent = [headers, ...rows].join('\n');
        
        // Ensure output directory exists
        const outputDir = path.dirname(outputPath);
        if (!fs.existsSync(outputDir)) {
          fs.mkdirSync(outputDir, { recursive: true });
        }
        
        // Write to file
        fs.writeFileSync(outputPath, csvContent);
        
        resolve(outputPath);
      } catch (error) {
        reject(new Error(`Failed to export CSV: ${error.message}`));
      }
    });
  }
}

module.exports = { 
  ReportGenerator,
  generateThreatReport: ReportGenerator.generateThreatReport.bind(ReportGenerator),
  prepareCSVData: ReportGenerator.prepareCSVData.bind(ReportGenerator),
  getCSVFields: ReportGenerator.getCSVFields.bind(ReportGenerator)
};