const { generateThreatReport } = require('../report_generator');

// Sample threat data to include in report
const sampleThreats = [
    {
        threat_name: 'SQL Injection',
        risk_score: 25,
        cve_id: 'CVE-2024-1234',
        asset_name: 'ShopCart API',
        description: 'Vulnerable input validation in login form allows for SQL injection attacks that could lead to unauthorized data access.'
    },
    {
        threat_name: 'DDoS Attack',
        risk_score: 15,
        cve_id: null,
        asset_name: 'Gateway Server',
        description: 'Recent distributed denial of service attempt targeting the main gateway.'
    },
    {
        threat_name: 'Phishing',
        risk_score: 18,
        cve_id: 'CVE-2023-5678',
        asset_name: 'Email Server',
        description: 'Sophisticated phishing campaign targeting executive accounts.'
    },
    {
        threat_name: 'Unpatched Software',
        risk_score: 12,
        cve_id: 'CVE-2024-0098',
        asset_name: 'File Server'
    },
    {
        threat_name: 'Weak Credentials',
        risk_score: 8,
        cve_id: null,
        asset_name: 'Admin Portal'
    },
    {
        threat_name: 'Outdated SSL Certificate',
        risk_score: 5,
        cve_id: null,
        asset_name: 'Dev Environment'
    }
];

if (generateThreatReport.length >= 2) {
    // Original function expected (threats, outputPath)
    generateThreatReport(sampleThreats, '../../../docs/test_threat_report.pdf');
} else {
    // Optimized function expects (threats, options)
    generateThreatReport(sampleThreats, {
        outputPath: 'test_threat_report.pdf',
        title: 'Security Threats Analysis',
        company: 'ACME Corporation',
        colors: {
            title: '#003366',
            header: '#0066cc',
            high: '#cc0000',
            medium: '#ff9900',
            low: '#339933',
            text: '#333333'
        }
    })
        .then(filePath => {
            console.log(`Report successfully generated at: ${filePath}`);
        })
        .catch(error => {
            console.error(`Error generating report: ${error.message}`);
        });
}