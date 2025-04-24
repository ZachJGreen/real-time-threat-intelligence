/**
 * Sorts threats from highest to lowest based on risk_score
 * @param {Array<Object>} threats - Each object must include `risk_score`
 * @returns {Array<Object>} - Sorted array of threats
 */
function prioritizeRisks(threats) {
    return threats
        .filter(t => typeof t.risk_score === "number")
        .sort((a, b) => b.risk_score - a.risk_score);
}

module.exports = { prioritizeRisks };

// Optional test
if (require.main === module) {
    const threats = [
        { name: "Phishing", risk_score: 30 },
        { name: "SQL Injection", risk_score: 20 },
        { name: "DDoS", risk_score: 25 }
    ];

    const sorted = prioritizeRisks(threats);
    console.log("Prioritized Threats:");
    sorted.forEach(t => console.log(`${t.name}: ${t.risk_score}`));
}
