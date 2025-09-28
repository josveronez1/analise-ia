# Análise BDRs - Next.js

Sistema de análise de performance de BDRs (Business Development Representatives) usando IA para avaliar Cold Calls e Reuniões 1:1.

## 🚀 Funcionalidades

- **Análise de Cold Calls**: Upload de áudio e análise automática usando IA
- **Análise de Reuniões 1:1**: Avaliação de reuniões semanais entre gestor e BDR
- **Dashboard**: Visualização de métricas e performance
- **Gestão de BDRs**: CRUD completo de BDRs
- **Scores da Conversa Híbrida**: Avaliação em 6 dimensões

## 🛠️ Tecnologias

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL (produção) / SQLite (desenvolvimento)
- **IA**: OpenAI GPT-4 e Whisper
- **Charts**: Recharts
- **Deploy**: Vercel

## 📋 Pré-requisitos

- Node.js 18+
- npm ou yarn
- Conta OpenAI (para API key)
- Banco de dados PostgreSQL (para produção)

## 🔧 Instalação

1. **Clone o repositório**
```bash
git clone <seu-repositorio>
cd analise-bdrs-nextjs-clean
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure as variáveis de ambiente**
```bash
cp .env.example .env
# Edite o .env com suas credenciais
```

4. **Configure o banco de dados**
```bash
npx prisma generate
npx prisma db push
```

5. **Execute em desenvolvimento**
```bash
npm run dev
```

## 🌐 Deploy no Vercel

1. **Faça push para o GitHub**
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

2. **Conecte ao Vercel**
- Acesse [vercel.com](https://vercel.com)
- Importe o projeto do GitHub
- Configure as variáveis de ambiente:
  - `DATABASE_URL`: URL do banco PostgreSQL
  - `OPENAI_API_KEY`: Sua chave da OpenAI

3. **Deploy automático**
- O Vercel fará deploy automaticamente
- Sua aplicação estará disponível em `https://seu-projeto.vercel.app`

## 📊 Variáveis de Ambiente

```env
# Database
DATABASE_URL="postgresql://username:password@hostname:port/database_name"

# OpenAI
OPENAI_API_KEY="sk-proj-your-openai-api-key-here"
```

## 🗂️ Estrutura do Projeto

```
src/
├── app/                    # App Router (Next.js 13+)
│   ├── api/               # API Routes
│   ├── bdrs/              # Página de BDRs
│   ├── cold-calls/        # Páginas de Cold Calls
│   ├── meetings/          # Páginas de Reuniões 1:1
│   └── page.tsx           # Dashboard principal
├── components/            # Componentes reutilizáveis
│   ├── charts/           # Componentes de gráficos
│   └── ui/               # Componentes de UI
└── lib/                  # Utilitários
    └── prisma.ts         # Cliente Prisma
```

## 🎯 Scores da Conversa Híbrida

O sistema avalia 6 dimensões da metodologia Conversa Híbrida:

1. **Warmer** - Aquecimento e rapport inicial
2. **Reframe** - Reframing de objeções e situações
3. **Rational Drowning** - Lidar com argumentos racionais
4. **Emotional Impact** - Criar impacto emocional
5. **New Way** - Apresentar novas perspectivas
6. **Your Solution** - Posicionar a solução

## 📝 Scripts Disponíveis

```bash
npm run dev      # Desenvolvimento
npm run build    # Build de produção
npm run start    # Servidor de produção
npm run lint     # Linting
```

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT.