const schedule = require(require.resolve('node-schedule', {
    paths: [require('path').resolve(__dirname, '../src/backend/node_modules')]
}));
const { fetchAndStoreShodanData } = require('./fetch_osint');

const ipsToScan = ['8.8.8.8', '1.1.1.1'];

async function jobCallback() {
    for (const ip of ipsToScan) {
        try {
            await fetchAndStoreShodanData(ip);
            console.log(`[Scheduler] Fetched and stored data for ${ip}`);
        } catch (error) {
            console.error(`[Scheduler] Failed for ${ip}:`, error.message);
        }
    }
}

function startScheduler() {
    schedule.scheduleJob('0 */6 * * *', jobCallback);
}

// 👇 Export these for testing
module.exports = {
    startScheduler,
    jobCallback,
};
