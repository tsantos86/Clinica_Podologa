import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase env vars:', { supabaseUrl, hasKey: !!supabaseKey });
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkRui() {
    const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .ilike('nome', '%Rui%')
        .eq('data', '2026-03-02');

    if (error) {
        console.error('Error fetching Rui:', error);
        return;
    }

    console.log('Appointments for Rui on 2026-03-02:');
    console.log(JSON.stringify(data, null, 2));
}

checkRui();
