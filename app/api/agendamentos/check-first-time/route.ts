import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/db';

/**
 * GET /api/agendamentos/check-first-time?telefone=9XXXXXXXX
 * 
 * Verifica se um número de telemóvel já tem agendamentos anteriores.
 * Retorna { firstTime: true } se nunca agendou, { firstTime: false } se já é cliente.
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const telefone = searchParams.get('telefone');

        if (!telefone) {
            return NextResponse.json({ error: 'Telefone não fornecido' }, { status: 400 });
        }

        // Limpar o telefone — remover tudo que não é número
        const cleaned = telefone.replace(/\D/g, '');

        if (cleaned.length < 9) {
            return NextResponse.json({ error: 'Telefone inválido' }, { status: 400 });
        }

        const supabase = getSupabase();

        // Buscar se existe QUALQUER agendamento com este telefone
        // Usamos variações comuns do mesmo número (com e sem prefixo 351)
        const phoneVariations = [cleaned];

        // Se tem 9 dígitos e começa com 9, adicionar variação com 351
        if (cleaned.length === 9 && cleaned.startsWith('9')) {
            phoneVariations.push('351' + cleaned);
        }
        // Se tem 12 dígitos e começa com 351, adicionar variação sem 351
        if (cleaned.length === 12 && cleaned.startsWith('351')) {
            phoneVariations.push(cleaned.slice(3));
        }

        // Buscar por qualquer variação do número
        const { count, error } = await supabase
            .from('appointments')
            .select('id', { count: 'exact', head: true })
            .in('telefone', phoneVariations);

        if (error) {
            console.error('Erro ao verificar telefone:', error);
            return NextResponse.json({ firstTime: true }); // Em caso de erro, mostrar política por segurança
        }

        return NextResponse.json({
            firstTime: (count ?? 0) === 0,
        });
    } catch (error) {
        console.error('Erro ao verificar primeiro agendamento:', error);
        return NextResponse.json({ firstTime: true }); // Em caso de erro, mostrar política
    }
}
