import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth';
import { getSupabase } from '@/lib/db';

export const runtime = 'nodejs';

/**
 * GET /api/services/photos - Buscar todas as fotos de serviços (público)
 */
export async function GET() {
  try {
    const supabase = getSupabase();

    const { data: rows, error } = await supabase
      .from('service_photos')
      .select('service_id, photo_url');

    if (error) {
      console.error('Erro ao buscar fotos:', error);
      return NextResponse.json({ error: 'Erro ao buscar fotos' }, { status: 500 });
    }

    const photos: Record<string, string> = {};
    (rows || []).forEach((row) => {
      photos[row.service_id] = row.photo_url;
    });

    return NextResponse.json(photos);
  } catch (error) {
    console.error('Erro ao buscar fotos:', error);
    return NextResponse.json({ error: 'Erro ao buscar fotos' }, { status: 500 });
  }
}

/**
 * POST /api/services/photos - Upload de foto (requer autenticação)
 * Usa Supabase Storage em vez de Vercel Blob
 */
export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação
    const auth = await authenticateRequest(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    const formData = await request.formData();
    const serviceId = formData.get('serviceId') as string;
    const file = formData.get('file') as File;

    if (!serviceId || !file) {
      return NextResponse.json(
        { error: 'serviceId e file são obrigatórios' },
        { status: 400 }
      );
    }

    // Validar tipo de arquivo
    const acceptedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (!acceptedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Tipo de arquivo não permitido. Aceitos: JPEG, PNG, WebP' },
        { status: 400 }
      );
    }

    // Validar tamanho (5MB)
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: 'Arquivo muito grande (máximo 5MB)' },
        { status: 400 }
      );
    }

    const supabase = getSupabase();

    // Verificar se já existe foto antiga para remover
    const { data: existingRows } = await supabase
      .from('service_photos')
      .select('photo_url, blob_url')
      .eq('service_id', serviceId);

    if (existingRows && existingRows.length > 0) {
      const oldBlobUrl = existingRows[0].blob_url as string;
      if (oldBlobUrl) {
        try {
          // Extrair o path do storage a partir da URL
          const urlParts = oldBlobUrl.split('/storage/v1/object/public/service-photos/');
          if (urlParts[1]) {
            await supabase.storage.from('service-photos').remove([urlParts[1]]);
          }
        } catch (e) {
          console.warn('Aviso: não foi possível remover foto antiga:', e);
        }
      }
    }

    // Upload para Supabase Storage
    const ext = file.name.split('.').pop() || 'jpg';
    const filename = `${serviceId}-${Date.now()}.${ext}`;
    const fileBuffer = await file.arrayBuffer();

    const { error: uploadError } = await supabase.storage
      .from('service-photos')
      .upload(filename, fileBuffer, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      console.error('Erro no upload:', uploadError);
      return NextResponse.json(
        { error: 'Erro ao fazer upload da foto.' },
        { status: 500 }
      );
    }

    // Obter URL pública
    const { data: publicUrlData } = supabase.storage
      .from('service-photos')
      .getPublicUrl(filename);

    const publicUrl = publicUrlData.publicUrl;

    // Salvar/atualizar no banco de dados
    const { error: dbError } = await supabase
      .from('service_photos')
      .upsert({
        service_id: serviceId,
        photo_url: publicUrl,
        blob_url: publicUrl,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'service_id' });

    if (dbError) {
      console.error('Erro ao salvar no DB:', dbError);
      return NextResponse.json(
        { error: 'Erro ao salvar referência da foto.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      url: publicUrl,
    });
  } catch (error) {
    console.error('Erro ao fazer upload:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro ao fazer upload' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/services/photos - Remover foto (requer autenticação)
 */
export async function DELETE(request: NextRequest) {
  try {
    // Verificar autenticação
    const auth = await authenticateRequest(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    const body = await request.json();
    const { serviceId } = body;

    if (!serviceId) {
      return NextResponse.json(
        { error: 'serviceId é obrigatório' },
        { status: 400 }
      );
    }

    const supabase = getSupabase();

    // Buscar blob URL para remover
    const { data: rows } = await supabase
      .from('service_photos')
      .select('blob_url')
      .eq('service_id', serviceId);

    if (rows && rows.length > 0) {
      const blobUrl = rows[0].blob_url as string;
      if (blobUrl) {
        try {
          const urlParts = blobUrl.split('/storage/v1/object/public/service-photos/');
          if (urlParts[1]) {
            await supabase.storage.from('service-photos').remove([urlParts[1]]);
          }
        } catch (e) {
          console.warn('Aviso: não foi possível remover foto:', e);
        }
      }

      // Remover do banco
      await supabase.from('service_photos').delete().eq('service_id', serviceId);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao remover foto:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro ao remover foto' },
      { status: 500 }
    );
  }
}
