// Ensure Node.js looks for modules in the backend folder
process.env.NODE_PATH = __dirname + "/node_modules";
require("module").Module._initPaths();

const express = require('express');
const cors = require('cors');
const { fetchShodanData } = require("../../api/fetch_osint");



require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());


app.get('/', (req, res) => {
    res.send('Welcome to the Real-Time Threat Intelligence API!');
});

app.post("/api/fetchShodanThreatData", async (req, res) => {
    const { ip } = req.body;  // Use req.body to access the IP

    if (!ip) {
        return res.status(400).json({ message: "IP address is required" });
    }

    try {
        await fetchAndStoreShodanData(ip);  // Call the function to fetch and store data
        res.json({ message: "Shodan threat data fetched and stored successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error fetching or storing Shodan data", error: error.message });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
