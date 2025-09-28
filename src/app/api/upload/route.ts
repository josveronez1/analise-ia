import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'Nenhum arquivo fornecido' },
        { status: 400 }
      );
    }

    // Validar tipo de arquivo
    const allowedTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/m4a', 'audio/ogg'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Tipo de arquivo não suportado. Use MP3, WAV, M4A ou OGG' },
        { status: 400 }
      );
    }

    // Validar tamanho (máximo 50MB para Blob Storage)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'Arquivo muito grande. Tamanho máximo: 50MB' },
        { status: 413 }
      );
    }

    // Upload para Vercel Blob Storage
    const blob = await put(file.name, file, {
      access: 'public',
    });

    return NextResponse.json({
      url: blob.url,
      filename: file.name,
      size: file.size,
      type: file.type
    });

  } catch (error) {
    console.error('Erro no upload:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
