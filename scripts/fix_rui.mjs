import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixRui() {
    const { data, error } = await supabase
        .from('appointments')
        .update({ hora: '08:30' })
        .ilike('nome', '%Rui Almeida%')
        .eq('data', '2026-03-02')
        .eq('hora', '188t9jo')
        .select();

    if (error) {
        console.error('Error fixing Rui:', error);
        return;
    }

    console.log('Fixed Rui:', JSON.stringify(data, null, 2));
}

fixRui();
