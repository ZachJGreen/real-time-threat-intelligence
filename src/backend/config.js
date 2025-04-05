
require('dotenv').config(); 

module.exports = {
    shodanApiKey: process.env.SHODAN_API_KEY,
    supabaseUrl: process.env.SUPABASE_URL,
    supabaseKey: process.env.SUPABASE_ANON_KEY
};