import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkRui() {
    const { data, error } = await supabase
        .from('appointments')
        .select('id, nome, hora, data, status')
        .ilike('nome', '%Rui%')
        .order('data', { ascending: false });

    if (error) {
        console.error('Error:', error);
        return;
    }

    console.log('Rui Appointments:');
    data.forEach(a => console.log(`${a.data} ${a.hora} - ${a.nome} (${a.status}) ID: ${a.id}`));
}

checkRui();
