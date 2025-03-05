const express = require('express')
const cors = require('cors')
require('dotenv').config()

const app = express()
const client = require("./pg")
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({extended:false}))


//app.get('/', (req, res) => {
    //res.send('API is running...')
//});

app.get('/',(req, res)=>{
    res.send('hi database is connected!!!!')
})

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))

