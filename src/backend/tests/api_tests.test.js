require('dotenv').config({ path: '../.env' });

const { fetchShodanData } = require('../../../api/shodan'); // Adjust path as needed

describe('Shodan API Integration', () => {
    const testIP = '8.8.8.8'; // Replace with a known-good IP if needed

    it('should return valid Shodan data structure', async () => {
        const data = await fetchShodanData(testIP);

        expect(data).toBeDefined();
        expect(typeof data).toBe('object');

        // Check for key fields — ports is critical
        expect(data).toHaveProperty('ports');
        expect(Array.isArray(data.ports)).toBe(true);

        // Optional but helpful
        expect(data).toHaveProperty('hostnames');
        expect(data).toHaveProperty('data');
        expect(Array.isArray(data.data)).toBe(true);
    });

    it('should not throw error on valid IP', async () => {
        await expect(fetchShodanData(testIP)).resolves.not.toThrow();
    });
});
