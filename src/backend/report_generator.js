const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

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
function generateThreatReport(threats, options = {}) {
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
        const fullPath = path.resolve(__dirname, '../../docs', path.basename(outputPath));
        const outputStream = fs.createWriteStream(fullPath);
        outputStream.on('error', (err) => {
            reject(new Error(`Failed to write PDF file: ${err.message}`));
        });

        doc.pipe(outputStream);

        try {
            // Add report header
            addReportHeader(doc, title, company, colors);

            // Add summary section
            addSummarySection(doc, threats, colors);

            // Add threat details
            addThreatDetails(doc, threats, colors);

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
 */
function addReportHeader(doc, title, company, colors) {
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
 */
function addSummarySection(doc, threats, colors) {
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
 */
function addThreatDetails(doc, threats, colors) {
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

module.exports = { generateThreatReport };