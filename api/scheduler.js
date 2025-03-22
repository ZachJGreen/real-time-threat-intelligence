const cron = require('node-cron');
const { fetchAndStoreShodanData } = require('./shodan_integration'); // Import the function


const ipAddresses = ['8.8.8.8', '1.1.1.1']; // Example IPs, replace with real ones

// Schedule the task every 6 hours (cron expression for every 6 hours)
cron.schedule('0 */6 * * *', async () => {
    console.log('Starting scheduled task to fetch and store Shodan data...');

    // Loop through the IP addresses and fetch/store their data
    for (const ip of ipAddresses) {
        await fetchAndStoreShodanData(ip);
        console.log(`Data for IP ${ip} fetched and stored successfully.`);
    }

    console.log('Scheduled task completed.');
});

// This keeps the scheduler running
console.log('Scheduler started. It will run every 6 hours.');
