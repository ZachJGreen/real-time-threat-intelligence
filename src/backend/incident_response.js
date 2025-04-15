/**
 * Get an incident response plan based on threat type
 * @param {string} threatType - The detected threat (e.g., "SQL Injection")
 * @returns {string[]} - List of response steps
 */
function getIncidentResponsePlan(threatType) {
    const responsePlans = {
        "SQL Injection": [
            "Block the offending IP address",
            "Patch the vulnerable endpoint",
            "Conduct forensic review of logs",
            "Notify web application devs"
        ],
        "Phishing": [
            "Alert affected users",
            "Force password reset for compromised accounts",
            "Update phishing email filters",
            "Review email server logs"
        ],
        "DDoS": [
            "Enable rate limiting on targeted services",
            "Activate DDoS protection services",
            "Monitor traffic anomalies",
            "Contact ISP or cloud provider if needed"
        ]
    };

    return responsePlans[threatType] || ["No response plan available for this threat type."];
}

module.exports = { getIncidentResponsePlan };

// Optional test
if (require.main === module) {
    const plan = getIncidentResponsePlan("DDoS");
    console.log("Incident Response for DDoS:");
    plan.forEach(step => console.log("- " + step));
}
