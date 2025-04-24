// /src/backend/mitigation_recommendations.js

/**
 * Returns recommended mitigation actions based on threat type
 * @param {string} threatType - e.g. "Phishing", "SQL Injection"
 * @returns {string[]} - List of mitigation strategies
 */
function getMitigationRecommendations(threatType) {
    const recommendations = {
        "SQL Injection": [
            "Use parameterized queries",
            "Sanitize all user inputs",
            "Deploy a Web Application Firewall (WAF)"
        ],
        "Phishing": [
            "Enforce 2FA for all users",
            "Train employees on phishing awareness",
            "Use advanced email filtering"
        ],
        "DDoS": [
            "Enable rate limiting",
            "Use DDoS protection services (e.g. Cloudflare, AWS Shield)",
            "Deploy traffic monitoring and anomaly detection tools"
        ],
        "Malware": [
            "Update antivirus definitions regularly",
            "Restrict admin privileges",
            "Conduct regular system scans"
        ]
    };

    return recommendations[threatType] || ["No recommendations available for this threat."];
}

module.exports = { getMitigationRecommendations };

// Optional test
if (require.main === module) {
    const recs = getMitigationRecommendations("Phishing");
    console.log("Recommendations for Phishing:");
    recs.forEach(r => console.log("- " + r));
}
