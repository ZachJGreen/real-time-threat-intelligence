const { fetchShodanData } = require('./shodan'); // Adjust path if needed

(async () => {
    try {
        console.log("Fetching Shodan data...");
        await fetchShodanData("8.8.8.8"); // Replace with any valid IP
        console.log("✅ Test complete. Check the database for stored threats.");
    } catch (error) {
        console.error("❌ Test failed:", error);
    }
})();