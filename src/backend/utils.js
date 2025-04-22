const { fetchAndStoreShodanData } = require("../../api/fetch_osint");
const schedule = require("node-schedule");

// Risk Score Calculator
function calculate_risk(likelihood, impact) { 
    return likelihood * impact;
}

// Data Fetch Scheduler
function fetch_scheduler(ip){
    // Execute fetchAndStoreShodanData function every 6 hours
    // '* * 6' is 6 hours in cron notation
    const job = schedule.scheduleJob('* * 6', (ip) => {
        fetchAndStoreShodanData(ip)
    });
}