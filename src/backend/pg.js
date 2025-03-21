const {Client} = require('pg');

const client = new Client({
    user: "postgres",
    host: "localhost",
    database: "threat_intelligence_db",
    port: 5432,
    password: "12345"
});

client.connect()
.then(()=>{console.log("Connected to pg")})
.catch((err)=>{console.error("Cant connect to pg", err)});

module.exports = { client };