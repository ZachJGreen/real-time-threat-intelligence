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
    res.send('API is running...');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))

