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


//app.get('/', (req, res) => {
    //res.send('Threat Intelligence API is running...');
//});
app.post("/api/fetchShodanThreatData", async (req, res) => {
    const { ip } = req.params;
    const data = await fetchandStoreShodanData(ip);
    await fetchAndStoreShodanData(ip);
    res.json({ message: "Shodan threat data fetched and stored successfully" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
