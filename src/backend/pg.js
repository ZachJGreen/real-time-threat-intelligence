const {Client} = require('pg')
const client = new Client({
    user:"postgres",
    host:"localhost",
    database:"threat_intelligence_db",
    port:5432,
    password:"12345"
})

client.connect()
.then(()=>{console.log("Connected to pg")})
.catch(()=>{console.log("Cant connect to pg")})

module.export={client}