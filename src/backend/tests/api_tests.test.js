require('dotenv').config({ path: '../.env' });
const axios = require('axios');
const { fetchShodanData } = require('../../../api/shodan');
const supabase = require('../supabase');

describe('Shodan API Integration', () => {
    const testIP = '8.8.8.8'; 
    const baseURL = 'http://localhost:5000';

    beforeAll(async () => {
        // Clean up test data if needed
        await supabase.from('tva_mapping').delete().eq('id', -1);
    });

    describe('Shodan API Integration', () => {
        it('should return valid Shodan data structure', async () => {
            const data = await fetchShodanData(testIP);
            expect(data).toBeDefined();
            expect(typeof data).toBe('object');
            expect(data).toHaveProperty('ports');
            expect(Array.isArray(data.ports)).toBe(true);
        });

        it('should handle invalid IP gracefully', async () => {
            const invalidIP = 'invalid.ip';
            const data = await fetchShodanData(invalidIP);
            expect(data).toBeNull();
        });
    });

    describe('Server Endpoints', () => {
        it('should fetch threat data from /api/getThreatData', async () => {
            const response = await axios.get(`${baseURL}/api/getThreatData`);
            expect(response.status).toBe(200);
            expect(Array.isArray(response.data)).toBe(true);
        });

        it('should fetch high risk threats', async () => {
            const response = await axios.get(`${baseURL}/api/getHighRiskThreats`);
            expect(response.status).toBe(200);
            expect(Array.isArray(response.data)).toBe(true);
        });

        it('should handle incident response requests', async () => {
            const response = await axios.get(`${baseURL}/api/incidentResponse?threatType=Phishing`);
            expect(response.status).toBe(200);
            expect(response.data).toHaveProperty('responsePlan');
        });
    });
});
