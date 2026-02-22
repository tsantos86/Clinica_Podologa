/**
 * Script para criar utilizadores admin no Supabase Auth
 * Executar com: npx tsx scripts/create-admin-users.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Carregar .env.local
dotenv.config({ path: resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !serviceRoleKey) {
    console.error('❌ Faltam variáveis de ambiente SUPABASE_URL ou SERVICE_ROLE_KEY');
    process.exit(1);
}

// Usar service role para criar utilizadores (admin API)
const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false }
});

const USERS = [
    {
        email: 'thiago.dev@steoliveirapodologa.pt',
        password: 'admin153524',
        name: 'Thiago Santos',
    },
    {
        email: 'stepodologa@steoliveirapodologa.pt',
        password: 'Stepodologa.26',
        name: 'Stephanie Oliveira',
    },
];

async function createUsers() {
    console.log('🔧 A criar utilizadores admin no Supabase...\n');

    for (const user of USERS) {
        console.log(`📧 A criar: ${user.email}`);

        const { data, error } = await supabase.auth.admin.createUser({
            email: user.email,
            password: user.password,
            email_confirm: true, // Confirmar email automaticamente
            user_metadata: {
                name: user.name,
                role: 'admin',
            },
        });

        if (error) {
            if (error.message.includes('already been registered')) {
                console.log(`   ⚠️ Já existe: ${user.email}`);
            } else {
                console.error(`   ❌ Erro: ${error.message}`);
            }
        } else {
            console.log(`   ✅ Criado com sucesso! ID: ${data.user.id}`);
        }
    }

    console.log('\n✅ Processo concluído!');
}

createUsers().catch(console.error);
