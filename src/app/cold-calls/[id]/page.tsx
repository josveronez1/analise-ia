'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';
import Card from '@/components/ui/Card';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import MarkdownRenderer from '@/components/ui/MarkdownRenderer';
import RadarChart from '@/components/charts/RadarChart';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

interface ColdCallAnalysis {
  coldCall: {
    id: number;
    prospectNome: string;
    prospectEmpresa: string;
    bdr: {
      id: number;
      nome: string;
    };
    scores: {
      warmerScore: number;
      reframeScore: number;
      rationalDrowningScore: number;
      emotionalImpactScore: number;
      newWayScore: number;
      yourSolutionScore: number;
    };
    createdAt: string;
  };
  analysisText: string;
}

export default function ColdCallDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [data, setData] = useState<ColdCallAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (params.id) {
      loadAnalysis();
    }
  }, [params.id]);

  const loadAnalysis = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/cold-calls/${params.id}/analysis`);
      
      if (!response.ok) {
        throw new Error('Erro ao carregar análise');
      }
      
      const analysisData = await response.json();
      setData(analysisData);
    } catch (error) {
      console.error('Erro ao carregar análise:', error);
      setError('Erro ao carregar análise da cold call');
    } finally {
      setIsLoading(false);
    }
  };

  const clearMessages = () => {
    setError(null);
  };

  // Preparar dados para o gráfico de radar
  const radarData = data ? [
    {
      subject: 'Warmer',
      score: data.coldCall.scores.warmerScore,
      fullMark: 10,
    },
    {
      subject: 'Reframe',
      score: data.coldCall.scores.reframeScore,
      fullMark: 10,
    },
    {
      subject: 'Rational Drowning',
      score: data.coldCall.scores.rationalDrowningScore,
      fullMark: 10,
    },
    {
      subject: 'Emotional Impact',
      score: data.coldCall.scores.emotionalImpactScore,
      fullMark: 10,
    },
    {
      subject: 'New Way',
      score: data.coldCall.scores.newWayScore,
      fullMark: 10,
    },
    {
      subject: 'Your Solution',
      score: data.coldCall.scores.yourSolutionScore,
      fullMark: 10,
    },
  ] : [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background transition-colors">
        <Navigation />
        <div className="max-w-7xl mx-auto p-6">
          <LoadingSpinner size="lg" text="Carregando análise..." className="h-64" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background transition-colors">
        <Navigation />
        <div className="max-w-7xl mx-auto p-6">
          <div className="p-4 bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-300 rounded-md flex justify-between items-center transition-colors">
            <span>{error}</span>
            <button onClick={clearMessages} className="text-red-700 dark:text-red-300 hover:text-red-900 dark:hover:text-red-100">
              ✕
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="min-h-screen bg-background transition-colors">
      <Navigation />
      
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <button
              onClick={() => router.back()}
              className="mr-4 p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Análise Detalhada</h1>
              <p className="text-muted-foreground mt-1">
                {data.coldCall.prospectNome} - {data.coldCall.prospectEmpresa}
              </p>
            </div>
          </div>
        </div>

        {/* Informações da Cold Call */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <div className="flex items-center">
              <div className="p-3 bg-muted rounded-full mr-4">
                <span className="text-2xl">👤</span>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">BDR</p>
                <p className="text-lg font-bold text-foreground">{data.coldCall.bdr.nome}</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center">
              <div className="p-3 bg-muted rounded-full mr-4">
                <span className="text-2xl">🏢</span>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Prospect</p>
                <p className="text-lg font-bold text-foreground">{data.coldCall.prospectNome}</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center">
              <div className="p-3 bg-muted rounded-full mr-4">
                <span className="text-2xl">📅</span>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Data da Análise</p>
                <p className="text-lg font-bold text-foreground">
                  {new Date(data.coldCall.createdAt).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Conteúdo Principal */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Gráfico Radar */}
          <Card 
            title="Scores - Conversa Híbrida"
            subtitle="Performance nesta cold call específica"
          >
            <RadarChart data={radarData} />
          </Card>

          {/* Análise Textual */}
          <Card 
            title="Análise Detalhada"
            subtitle="Insights específicos desta conversa"
          >
            <div className="h-80 overflow-y-auto">
              <MarkdownRenderer content={data.analysisText} />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
