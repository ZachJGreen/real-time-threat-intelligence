
const { createClient } = require('@supabase/supabase-js');
const { supabaseUrl, supabaseKey } = require('./config');

if (!supabaseUrl || !supabaseKey) {
    console.error('Supabase credentials are missing in environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;