
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function check() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !key) {
        console.log('Missing env vars');
        return;
    }

    const supabase = createClient(url, key);
    const { data, error } = await supabase.from('appointments').select('id').limit(1);

    if (error) {
        console.log('Error:', error.message);
    } else {
        console.log('Success, found:', data.length, 'records');
    }
}

check();
