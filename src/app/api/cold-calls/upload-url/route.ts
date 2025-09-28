import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// POST - Analisar Cold Call via URL
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bdrId, prospectNome, prospectEmpresa, insightComercial, audioUrl } = body;

    // Validar dados
    if (!bdrId || !prospectNome || !prospectEmpresa || !audioUrl) {
      return NextResponse.json(
        { error: 'Dados obrigatórios não fornecidos' },
        { status: 400 }
      );
    }

    // Validar URL
    try {
      new URL(audioUrl);
    } catch {
      return NextResponse.json(
        { error: 'URL inválida' },
        { status: 400 }
      );
    }

    // Baixar arquivo da URL
    const response = await fetch(audioUrl);
    if (!response.ok) {
      return NextResponse.json(
        { error: 'Erro ao baixar arquivo de áudio' },
        { status: 400 }
      );
    }

    const audioBuffer = await response.arrayBuffer();
    const audioFile = new File([audioBuffer], 'audio.mp3', { type: 'audio/mpeg' });

    // Validar tamanho do arquivo (máximo 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (audioFile.size > maxSize) {
      return NextResponse.json(
        { error: 'Arquivo muito grande. Tamanho máximo: 10MB' },
        { status: 413 }
      );
    }

    // Transcrever áudio com Whisper
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-1',
    });

    // Analisar com GPT-4
    const analysis = await openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: [
        {
          role: 'user',
          content: `Analise este cold call baseado na metodologia Conversa Híbrida (6 etapas):

BDR: ${prospectNome}
Prospect: ${prospectNome}
Empresa: ${prospectEmpresa}
Insight Comercial: ${insightComercial}

Transcrição: ${transcription.text}

Avalie cada etapa de 0 a 10 e forneça:

### SCORES CONVERSA HÍBRIDA
**Warmer:** X/10
**Reframe:** X/10
**Rational Drowning:** X/10
**Emotional Impact:** X/10
**New Way:** X/10
**Your Solution:** X/10

### ANÁLISE DETALHADA
(Análise completa da ligação)

### PONTOS DE ATENÇÃO
(Áreas que precisam de melhoria)

### RECOMENDAÇÕES
(Ações específicas para melhorar)`
        }
      ]
    });

    const analysisText = analysis.choices[0].message.content || '';

    // Extrair scores
    const scores = {
      warmerScore: extractScore(analysisText, 'Warmer'),
      reframeScore: extractScore(analysisText, 'Reframe'),
      rationalDrowningScore: extractScore(analysisText, 'Rational Drowning'),
      emotionalImpactScore: extractScore(analysisText, 'Emotional Impact'),
      newWayScore: extractScore(analysisText, 'New Way'),
      yourSolutionScore: extractScore(analysisText, 'Your Solution'),
    };

    // Extrair seções
    const pontosAtencao = extractSection(analysisText, 'PONTOS DE ATENÇÃO');
    const recomendacoes = extractSection(analysisText, 'RECOMENDAÇÕES');

    // Salvar no banco
    const coldCall = await prisma.coldCall.create({
      data: {
        bdrId,
        prospectNome,
        prospectEmpresa,
        insightComercial,
        ...scores,
        analiseCompleta: analysisText,
        pontosAtencao,
        recomendacoes,
      },
    });

    return NextResponse.json(coldCall);
  } catch (error) {
    console.error('Erro ao analisar cold call:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// Função para extrair scores
function extractScore(text: string, step: string): number {
  const regex = new RegExp(`${step}.*?(\\d+)/10`, 'i');
  const match = text.match(regex);
  return match ? parseInt(match[1]) : 5;
}

// Função para extrair seções
function extractSection(text: string, section: string): string {
  const regex = new RegExp(`${section}[\\s\\S]*?(?=###|$)`, 'i');
  const match = text.match(regex);
  return match ? match[0].replace(section, '').trim() : 'Não encontrado';
}
