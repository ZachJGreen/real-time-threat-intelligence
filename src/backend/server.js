// Ensure Node.js looks for modules in the backend folder
process.env.NODE_PATH = __dirname + "/node_modules";
require("module").Module._initPaths();

const express = require('express');
const cors = require('cors');
const { fetchShodanData } = require("../../api/shodan.js");
require('dotenv').config();

const app = express()
const client = require("./pg")
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({extended:false}))


app.get('/', (req, res) => {
    res.send('Threat Intelligence API is running...');
});
app.get("/shodanFetchIPData/:ip", async (req, res) => {
    const { ip } = req.params;
    const data = await fetchShodanData(ip);
    if (data) {
        res.json(data);
    } else {
        res.status(500).json({ error: "Failed to fetch data from Shodan" });
    }
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))

