// /src/backend/tests/scheduler.test.js

// ✅ Load env variables from the backend folder
require('dotenv').config({ path: '../.env' });

// ✅ Mock the Shodan fetch function so we don’t actually call the API
jest.mock('../../../api/fetch_osint', () => ({
    fetchAndStoreShodanData: jest.fn(() => Promise.resolve('mocked data'))
}));

// ✅ Use fake timers
jest.useFakeTimers();

const { jobCallback, startScheduler } = require('../../../api/scheduler');
const { fetchAndStoreShodanData } = require('../../../api/fetch_osint');
const schedule = require('node-schedule');

describe('Scheduler Module', () => {
    test('jobCallback should call fetchAndStoreShodanData for each IP', async () => {
        await jobCallback();

        // Check it was called twice for the 2 IPs in scheduler.js
        expect(fetchAndStoreShodanData).toHaveBeenCalledTimes(2);
        expect(fetchAndStoreShodanData).toHaveBeenCalledWith('8.8.8.8');
        expect(fetchAndStoreShodanData).toHaveBeenCalledWith('1.1.1.1');
    });

    test('startScheduler should register a job in node-schedule', () => {
        startScheduler();

        const jobs = schedule.scheduledJobs;
        const jobNames = Object.keys(jobs);

        expect(jobNames.length).toBeGreaterThan(0); // At least one job registered
    });
});
