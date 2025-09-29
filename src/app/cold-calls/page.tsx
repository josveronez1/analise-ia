'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navigation from '@/components/Navigation';

interface BDR {
  id: number;
  nome: string;
}

interface AnalysisResult {
  id: number;
  prospectNome: string;
  prospectEmpresa: string;
  insightComercial: string | null;
  warmerScore: number;
  reframeScore: number;
  rationalDrowningScore: number;
  emotionalImpactScore: number;
  newWayScore: number;
  yourSolutionScore: number;
  pontosAtencao: string;
  recomendacoes: string;
  analiseCompleta: string;
  createdAt: string;
}

interface ColdCall {
  id: number;
  prospectNome: string;
  prospectEmpresa: string;
  insightComercial: string | null;
  warmerScore: number;
  reframeScore: number;
  rationalDrowningScore: number;
  emotionalImpactScore: number;
  newWayScore: number;
  yourSolutionScore: number;
  pontosAtencao: string;
  recomendacoes: string;
  createdAt: string;
  bdr: BDR;
}

export default function ColdCallsPage() {
  // Estados para nova análise
  const [bdrs, setBdrs] = useState<BDR[]>([]);
  const [selectedBdr, setSelectedBdr] = useState<number | null>(null);
  const [prospectNome, setProspectNome] = useState('');
  const [prospectEmpresa, setProspectEmpresa] = useState('');
  const [insightComercial, setInsightComercial] = useState('');
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoadingBdrs, setIsLoadingBdrs] = useState(true);

  // Estados para gerenciamento
  const [coldCalls, setColdCalls] = useState<ColdCall[]>([]);
  const [isLoadingColdCalls, setIsLoadingColdCalls] = useState(true);
  
  // Filtros para gerenciamento
  const [manageSelectedBdr, setManageSelectedBdr] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'score'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Carregar dados
  useEffect(() => {
    loadBdrs();
    loadColdCalls();
  }, []);

  const loadBdrs = async () => {
    try {
      setIsLoadingBdrs(true);
      const response = await fetch('/api/bdrs');
      if (!response.ok) {
        throw new Error('Erro ao carregar BDRs');
      }
      const data = await response.json();
      setBdrs(data);
    } catch (error) {
      console.error('Erro ao carregar BDRs:', error);
      setError('Erro ao carregar BDRs');
    } finally {
      setIsLoadingBdrs(false);
    }
  };

  const loadColdCalls = async () => {
    try {
      setIsLoadingColdCalls(true);
      const response = await fetch('/api/cold-calls');
      if (!response.ok) {
        throw new Error('Erro ao carregar cold calls');
      }
      const data = await response.json();
      setColdCalls(data);
    } catch (error) {
      console.error('Erro ao carregar cold calls:', error);
      setError('Erro ao carregar cold calls');
    } finally {
      setIsLoadingColdCalls(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 25 * 1024 * 1024) {
        setError('Arquivo muito grande. Máximo permitido: 25MB');
        return;
      }
      setAudioFile(file);
      setError(null);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedBdr || !prospectNome || !prospectEmpresa || !audioFile) {
      setError('Todos os campos obrigatórios devem ser preenchidos');
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setSuccess(null);

    try {
      const formData = new FormData();
      formData.append('audioFile', audioFile);
      formData.append('bdrId', selectedBdr.toString());
      formData.append('prospectNome', prospectNome);
      formData.append('prospectEmpresa', prospectEmpresa);
      formData.append('insightComercial', insightComercial);

      const response = await fetch('/api/cold-calls', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao analisar cold call');
      }

      const result = await response.json();
      setAnalysisResult(result);
      setSuccess('Análise concluída com sucesso!');
      
      // Limpar formulário
      setSelectedBdr(null);
      setProspectNome('');
      setProspectEmpresa('');
      setInsightComercial('');
      setAudioFile(null);
      
      // Recarregar lista de cold calls
      loadColdCalls();
    } catch (error) {
      console.error('Erro na análise:', error);
      setError(error instanceof Error ? error.message : 'Erro interno do servidor');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const clearMessages = () => {
    setError(null);
    setSuccess(null);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja deletar esta análise?')) {
      return;
    }

    try {
      const response = await fetch(`/api/cold-calls/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Erro ao deletar análise');
      }

      setSuccess('Análise deletada com sucesso!');
      loadColdCalls();
    } catch (error) {
      console.error('Erro ao deletar:', error);
      setError('Erro ao deletar análise');
    }
  };

  const getAverageScore = (coldCall: ColdCall) => {
    const scores = [
      coldCall.warmerScore,
      coldCall.reframeScore,
      coldCall.rationalDrowningScore,
      coldCall.emotionalImpactScore,
      coldCall.newWayScore,
      coldCall.yourSolutionScore,
    ];
    const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    return average.toFixed(1);
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'bg-green-100 text-green-800';
    if (score >= 6) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const filteredColdCalls = coldCalls
    .filter((coldCall) => {
      if (manageSelectedBdr && coldCall.bdr.id !== manageSelectedBdr) return false;
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        return (
          coldCall.prospectNome.toLowerCase().includes(search) ||
          coldCall.prospectEmpresa.toLowerCase().includes(search) ||
          coldCall.bdr.nome.toLowerCase().includes(search)
        );
      }
      return true;
    })
    .sort((a, b) => {
      let aValue: number | string;
      let bValue: number | string;

      if (sortBy === 'score') {
        aValue = parseFloat(getAverageScore(a));
        bValue = parseFloat(getAverageScore(b));
      } else {
        aValue = new Date(a.createdAt).getTime();
        bValue = new Date(b.createdAt).getTime();
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  return (
    <div className="min-h-screen bg-background transition-colors">
      <Navigation />
      
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            Cold Calls
          </h1>
        </div>

        {/* Mensagens de Sucesso/Erro */}
        {success && (
          <div className="mb-6 p-4 bg-green-100 dark:bg-green-900/20 border border-green-400 dark:border-green-600 text-green-700 dark:text-green-300 rounded-md flex justify-between items-center transition-colors">
            <span>{success}</span>
            <button onClick={clearMessages} className="text-green-700 dark:text-green-300 hover:text-green-900 dark:hover:text-green-100">
              ✕
            </button>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-300 rounded-md flex justify-between items-center transition-colors">
            <span>{error}</span>
            <button onClick={clearMessages} className="text-red-700 dark:text-red-300 hover:text-red-900 dark:hover:text-red-100">
              ✕
            </button>
          </div>
        )}

        {/* Seção 1: Nova Análise */}
        <div className="bg-card rounded-lg shadow-sm border border-border p-6 mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-4">Nova Análise de Cold Call</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                BDR *
              </label>
              {isLoadingBdrs ? (
                <div className="w-full p-3 border border-input rounded-md bg-muted animate-pulse">
                  Carregando BDRs...
                </div>
              ) : (
                <select
                  value={selectedBdr || ''}
                  onChange={(e) => setSelectedBdr(parseInt(e.target.value))}
                  className="w-full p-3 border border-input bg-background text-foreground rounded-md focus:ring-2 focus:ring-ring focus:border-transparent placeholder-muted-foreground transition-colors"
                >
                  <option value="">Selecione um BDR</option>
                  {bdrs.map((bdr) => (
                    <option key={bdr.id} value={bdr.id}>
                      {bdr.nome}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                Nome do Prospect *
              </label>
              <input
                type="text"
                value={prospectNome}
                onChange={(e) => setProspectNome(e.target.value)}
                className="w-full p-3 border border-input bg-background text-foreground rounded-md focus:ring-2 focus:ring-ring focus:border-transparent placeholder-muted-foreground transition-colors"
                placeholder="Nome do prospect (mín. 2 caracteres)"
                maxLength={100}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {prospectNome.length}/100 caracteres
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                Empresa do Prospect *
              </label>
              <input
                type="text"
                value={prospectEmpresa}
                onChange={(e) => setProspectEmpresa(e.target.value)}
                className="w-full p-3 border border-input bg-background text-foreground rounded-md focus:ring-2 focus:ring-ring focus:border-transparent placeholder-muted-foreground transition-colors"
                placeholder="Empresa do prospect (mín. 2 caracteres)"
                maxLength={100}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {prospectEmpresa.length}/100 caracteres
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                Insight Comercial (Opcional)
              </label>
              <textarea
                value={insightComercial}
                onChange={(e) => setInsightComercial(e.target.value)}
                className="w-full p-3 border border-input bg-background text-foreground rounded-md focus:ring-2 focus:ring-ring focus:border-transparent placeholder-muted-foreground transition-colors"
                placeholder="Insight comercial sobre o prospect"
                rows={3}
                maxLength={200}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {insightComercial.length}/200 caracteres
              </p>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Arquivo de Áudio *
            </label>
            <input
              type="file"
              accept="audio/*"
              onChange={handleFileChange}
              className="w-full p-3 border border-input bg-background text-foreground rounded-md focus:ring-2 focus:ring-ring focus:border-transparent placeholder-muted-foreground transition-colors"
            />
            {audioFile && (
              <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                <p className="text-xs text-blue-600 dark:text-blue-300">
                  Arquivo selecionado: {audioFile.name}
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-300">
                  Tamanho: {(audioFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              Formatos aceitos: MP3, WAV, M4A, etc. Máximo: 25MB
            </p>
          </div>

          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing || !selectedBdr || !prospectNome || !prospectEmpresa || !audioFile}
            className="w-full bg-primary text-primary-foreground py-3 px-4 rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isAnalyzing ? 'Analisando...' : 'Analisar Cold Call'}
          </button>
        </div>

        {/* Seção 2: Análises Realizadas */}
        <div className="bg-card rounded-lg shadow-sm border border-border p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-foreground">Análises Realizadas</h2>
            <span className="text-sm text-muted-foreground">
              {filteredColdCalls.length} análise(s) encontrada(s)
            </span>
          </div>

          {/* Filtros */}
          <div className="bg-muted rounded-lg p-4 mb-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Filtros</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  BDR
                </label>
                <select
                  value={manageSelectedBdr || ''}
                  onChange={(e) => setManageSelectedBdr(e.target.value ? parseInt(e.target.value) : null)}
                  className="w-full p-2 border border-input bg-background text-foreground rounded-md focus:ring-2 focus:ring-ring placeholder-muted-foreground transition-colors"
                >
                  <option value="">Todos os BDRs</option>
                  {bdrs.map((bdr) => (
                    <option key={bdr.id} value={bdr.id}>
                      {bdr.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Buscar
                </label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Nome, empresa ou BDR..."
                  className="w-full p-2 border border-input bg-background text-foreground rounded-md focus:ring-2 focus:ring-ring placeholder-muted-foreground transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Ordenar por
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'date' | 'score')}
                  className="w-full p-2 border border-input bg-background text-foreground rounded-md focus:ring-2 focus:ring-ring placeholder-muted-foreground transition-colors"
                >
                  <option value="date">Data</option>
                  <option value="score">Score Médio</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Ordem
                </label>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                  className="w-full p-2 border border-input bg-background text-foreground rounded-md focus:ring-2 focus:ring-ring placeholder-muted-foreground transition-colors"
                >
                  <option value="desc">Decrescente</option>
                  <option value="asc">Crescente</option>
                </select>
              </div>
            </div>
          </div>

          {/* Lista de Cold Calls */}
          {isLoadingColdCalls ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground mt-2">Carregando análises...</p>
            </div>
          ) : filteredColdCalls.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <p>Nenhuma análise encontrada.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Prospect
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      BDR
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Score Médio
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Data
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-card divide-y divide-border">
                  {filteredColdCalls.map((coldCall) => (
                    <tr key={coldCall.id} className="hover:bg-muted/50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-foreground">
                            {coldCall.prospectNome}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {coldCall.prospectEmpresa}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                        {coldCall.bdr.nome}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getScoreColor(parseFloat(getAverageScore(coldCall)))}`}>
                          {getAverageScore(coldCall)}/10
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                        {new Date(coldCall.createdAt).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleDelete(coldCall.id)}
                          className="text-red-600 hover:text-red-900 mr-4"
                        >
                          Deletar
                        </button>
                        <Link
                          href={`/cold-calls/${coldCall.id}`}
                          className="text-primary hover:text-primary/80"
                        >
                          Ver Detalhes
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Resultado da Análise */}
        {analysisResult && (
          <div className="bg-card rounded-lg shadow-sm border border-border p-6 mt-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-foreground">Resultado da Análise</h2>
              <span className="text-sm text-muted-foreground">
                {new Date(analysisResult.createdAt).toLocaleString('pt-BR')}
              </span>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-300">
                  {analysisResult.warmerScore}/10
                </div>
                <div className="text-sm text-foreground">Warmer</div>
              </div>
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="text-2xl font-bold text-green-600 dark:text-green-300">
                  {analysisResult.reframeScore}/10
                </div>
                <div className="text-sm text-foreground">Reframe</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-300">
                  {analysisResult.rationalDrowningScore}/10
                </div>
                <div className="text-sm text-foreground">Rational Drowning</div>
              </div>
              <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-300">
                  {analysisResult.emotionalImpactScore}/10
                </div>
                <div className="text-sm text-foreground">Emotional Impact</div>
              </div>
              <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <div className="text-2xl font-bold text-red-600 dark:text-red-300">
                  {analysisResult.newWayScore}/10
                </div>
                <div className="text-sm text-foreground">New Way</div>
              </div>
              <div className="text-center p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-300">
                  {analysisResult.yourSolutionScore}/10
                </div>
                <div className="text-sm text-foreground">Your Solution</div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-foreground mb-2">Pontos de Atenção</h3>
                <p className="text-foreground whitespace-pre-line bg-muted p-3 rounded-md">
                  {analysisResult.pontosAtencao}
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-foreground mb-2">Recomendações</h3>
                <p className="text-foreground whitespace-pre-line bg-muted p-3 rounded-md">
                  {analysisResult.recomendacoes}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}