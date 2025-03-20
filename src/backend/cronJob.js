const cron = require('node-cron');
const { fetchShodanData } = require("../../api/shodan.js");

console.log("Scheduler started...");

// Schedule the job to run every 6 hours (adjust as needed)
cron.schedule('*/5 * * * * *', async () => {
    console.log(`[${new Date().toISOString()}] Running threat intelligence update...`);

    try {
        const ip = "8.8.8.8"; // Replace with dynamic input

        // Fetch threat intelligence data
        await fetchShodanData(ip);

        console.log(`[${new Date().toISOString()}] Threat intelligence update completed.`);
    } catch (error) {
        console.error("Error running scheduled threat intelligence fetch:", error.message);
    }
});
