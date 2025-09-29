import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// POST - Analisar Reunião 1:1
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const bdrId = parseInt(formData.get('bdrId') as string);
    const dataReuniao = formData.get('dataReuniao') as string;
    const audioFile = formData.get('audioFile') as File;

    // Validar dados
    if (!bdrId) {
      return NextResponse.json(
        { error: 'BDR é obrigatório' },
        { status: 400 }
      );
    }
    if (!dataReuniao) {
      return NextResponse.json(
        { error: 'Data da reunião é obrigatória' },
        { status: 400 }
      );
    }
    if (!audioFile) {
      return NextResponse.json(
        { error: 'Arquivo de áudio é obrigatório' },
        { status: 400 }
      );
    }

    let transcription = '';
    
    // Transcrever áudio se fornecido
    if (audioFile) {
      const transcriptionResult = await openai.audio.transcriptions.create({
        file: audioFile,
        model: 'whisper-1',
      });
      transcription = transcriptionResult.text;
    }

    // Analisar com GPT-4
    const analysis = await openai.chat.completions.create({
      model: 'gpt-4-turbo', 
      messages: [{
        role: 'system',
        content: `Você é um coach de vendas e especialista em gestão de performance de equipes de BDRs (Business Development Representatives). Sua função é analisar transcrições de reuniões 1:1 semanais entre gestores e seus BDRs. O foco da sua análise deve ser a avaliação da performance, a identificação de desafios, o desenvolvimento de habilidades e o planejamento de metas claras para o BDR. O output gerado servirá como um guia para a próxima reunião de 1:1.`
      }, {
        role: 'user',
        content: `Analise a seguinte transcrição de uma reunião 1:1, focando no BDR e nas metas para a próxima semana. Siga estritamente a estrutura de output definida abaixo, que será usada como pauta para a próxima reunião.
  
  ${transcription ? `TRANSCRIÇÃO DA REUNIÃO:
  ${transcription}` : 'ÁUDIO: Arquivo de áudio fornecido para análise.'}
  
  INSTRUÇÕES PARA ANÁLISE:
  1.  **Foco para a Próxima Semana:** Esta é a seção mais importante. Extraia ou defina as metas SMART do BDR para a próxima semana. Detalhe o plano de ação com os passos que o BDR deve seguir. Separe claramente metas de resultado (ex: agendamentos) e metas de desenvolvimento (ex: aprender uma nova técnica).
  2.  **Análise Detalhada do BDR:** Forneça um feedback aprofundado sobre a performance do BDR na semana que passou. Use exemplos da transcrição para ilustrar os pontos.
  3.  **Resumo Geral:** Crie um resumo conciso dos temas centrais da conversa.
  4.  **Pontos de Apoio do Gestor:** Liste as ações específicas que o gestor se comprometeu a fazer para ajudar o BDR a atingir suas metas (ex: treinamentos, recursos, etc.).
  
  ESTRUTURA DE OUTPUT (use este formato):
  
  ### FOCO PARA A PRÓXIMA SEMANA: METAS E AÇÕES DO BDR
  **Metas de Resultado:**
  - (Liste as metas de resultado, ex: Agendar X reuniões)
  **Metas de Desenvolvimento:**
  - (Liste as metas de desenvolvimento, ex: Dominar técnica Y)
  **Plano de Ação (Passo a Passo):**
  - [ ] (Ação específica 1)
  - [ ] (Ação específica 2)
  
  ### ANÁLISE DETALHADA DO BDR
  **Conquistas e Pontos Fortes:**
  - (Liste os sucessos e comportamentos positivos do BDR)
  **Desafios e Pontos de Melhoria:**
  - (Liste as dificuldades e áreas para desenvolvimento do BDR)
  
  ### RESUMO GERAL DA REUNIÃO
  (Um breve resumo dos pontos-chave discutidos)
  
  ### PONTOS DE APOIO DO GESTOR
  - (Liste as ações que o gestor fará para apoiar o BDR)`
      }]
    });

    const analysisText = analysis.choices[0].message.content || '';

    // Extrair seções do novo formato
    const resumoGerado = extractSection(analysisText, 'RESUMO GERAL DA REUNIÃO');
    const metasGeradas = extractSection(analysisText, 'FOCO PARA A PRÓXIMA SEMANA');
    const pontosAtencao = extractSection(analysisText, 'DESAFIOS E PONTOS DE MELHORIA');
    const recomendacoes = extractSection(analysisText, 'PONTOS DE APOIO DO GESTOR');

    // Salvar no banco
    const meeting = await prisma.meeting.create({
      data: {
        bdrId,
        dataReuniao: new Date(dataReuniao),
        resumo: resumoGerado,
        metas: metasGeradas,
        // Scores padrão (não usados mais no novo formato)
        warmerScore: 0,
        reframeScore: 0,
        rationalDrowningScore: 0,
        emotionalImpactScore: 0,
        newWayScore: 0,
        yourSolutionScore: 0,
        analiseCompleta: analysisText,
        pontosAtencao,
        recomendacoes,
      },
    });

    return NextResponse.json(meeting);
  } catch (error) {
    console.error('Erro ao analisar reunião:', error);
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