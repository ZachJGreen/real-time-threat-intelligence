const supabase = require('./supabase'); // uses your existing config.js + supabase.js
const { generateThreatReport } = require('./report_generator');

async function generateLiveThreatReport() {
    try {
        const { data, error } = await supabase
            .from('tva_mapping')
            .select(`
                risk_score,
                assets:asset_id (asset_name),
                threats:threat_id (threat_name),
                vulnerabilities:vulnerability_id (cve_id)
            `);

        if (error) throw error;

        const reportData = data.map(item => ({
            threat_name: item.threats?.threat_name || 'Unknown',
            risk_score: item.risk_score || 0,
            cve_id: item.vulnerabilities?.cve_id || 'N/A',
            asset_name: item.assets?.asset_name || 'Unknown'
        }));

        generateThreatReport(reportData, '../../docs/live_threat_report.pdf');
    } catch (err) {
        console.error('Error generating live threat report:', err.message);
    }
}

generateLiveThreatReport();
