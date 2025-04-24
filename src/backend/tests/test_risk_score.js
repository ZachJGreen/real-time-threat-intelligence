const { calculateRiskScore } = require('../risk_scoring');

// Test Case 1: Recent threat (5 days ago)
const testRecentThreat = () => {
    const likelihood = 4;
    const impact = 5;
    const lastSeen = new Date();
    lastSeen.setDate(lastSeen.getDate() - 5); // Seen 5 days ago
    const score = calculateRiskScore(likelihood, impact, lastSeen);
    console.log(`Test 1 - Recent threat (5 days ago): ${score}`);
    return score;
};

// Test Case 2: Older threat (30 days ago)
const testOlderThreat = () => {
    const likelihood = 4;
    const impact = 5;
    const lastSeen = new Date();
    lastSeen.setDate(lastSeen.getDate() - 30); // Seen 30 days ago
    const score = calculateRiskScore(likelihood, impact, lastSeen);
    console.log(`Test 2 - Older threat (30 days ago): ${score}`);
    return score;
};

// Test Case 3: Custom decay rate
const testCustomDecay = () => {
    const likelihood = 4;
    const impact = 5;
    const lastSeen = new Date();
    lastSeen.setDate(lastSeen.getDate() - 10); // Seen 10 days ago
    const score = calculateRiskScore(likelihood, impact, lastSeen, { decayRate: 0.02 });
    console.log(`Test 3 - Custom decay rate (0.02): ${score}`);
    return score;
};

// Test Case 4: Edge case - today
const testTodayThreat = () => {
    const likelihood = 3;
    const impact = 4;
    const lastSeen = new Date(); // Seen today
    const score = calculateRiskScore(likelihood, impact, lastSeen);
    console.log(`Test 4 - Today's threat: ${score}`);
    return score;
};

// Run all tests
try {
    const recentScore = testRecentThreat();
    const olderScore = testOlderThreat();
    const customScore = testCustomDecay();
    const todayScore = testTodayThreat();

    console.log("\n--- Test Summary ---");
    console.log(`Recent threat score: ${recentScore}`);
    console.log(`Older threat score: ${olderScore}`);
    console.log(`Custom decay score: ${customScore}`);
    console.log(`Today's threat score: ${todayScore}`);
    console.log("All tests completed successfully!");
} catch (error) {
    console.error("Test failed:", error.message);
}