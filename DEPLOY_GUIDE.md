# 🚀 Guia de Deploy - Vercel + GitHub

Este guia te ajudará a fazer o deploy da aplicação **Análise BDRs** no Vercel usando GitHub.

## 📋 Pré-requisitos

- ✅ Conta no GitHub
- ✅ Conta no Vercel
- ✅ Banco de dados PostgreSQL (ex: Neon, Supabase, Railway, etc.)
- ✅ Chave da API OpenAI

## 🗄️ 1. Banco de Dados Neon (✅ CONFIGURADO)

O banco Neon já está configurado e funcionando:
- **Database**: `neondb` 
- **Region**: `sa-east-1` (São Paulo)
- **Status**: ✅ Conectado e migrações executadas
- **Connection String**: Já configurada no `.env`

**Dados do banco atual:**
```
postgresql://neondb_owner:npg_n4KWUXzRm8wa@ep-flat-river-ac3ewi50-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

## 🔑 2. Chave da OpenAI (✅ CONFIGURADA)

A chave da OpenAI já está configurada no projeto:
- **Status**: ✅ Configurada no `.env`
- **Chave**: `sk-proj-***` (configurada no Vercel)

## 📤 3. Push para GitHub (✅ PRONTO)

O projeto já está inicializado no git e pronto para push:

```bash
# 1. Conectar ao repositório GitHub (você precisa criar no GitHub)
git remote add origin https://github.com/SEU_USUARIO/analise-ia.git

# 2. Push para o GitHub
git push -u origin main
```

**Status atual:**
- ✅ Git inicializado
- ✅ Commit inicial feito
- ✅ 37 arquivos commitados
- 🔄 **Próximo passo**: Criar repositório no GitHub e conectar

## 🌐 4. Deploy no Vercel

### Passo 1: Conectar Projeto
1. Acesse [vercel.com](https://vercel.com)
2. Faça login com sua conta GitHub
3. Clique em "New Project"
4. Importe seu repositório `analise-ia`

### Passo 2: Configurar Variáveis de Ambiente
No painel do Vercel, vá em **Settings > Environment Variables** e adicione:

```
DATABASE_URL = postgresql://user:password@host:port/database
OPENAI_API_KEY = sk-proj-sua-chave-openai-aqui
```

### Passo 3: Configurar Build Settings
O Vercel detectará automaticamente que é um projeto Next.js, mas verifique:

- **Framework Preset**: Next.js
- **Build Command**: `npm run build` (já configurado)
- **Install Command**: `npm install` (já configurado)
- **Root Directory**: `./` (raiz do projeto)

### Passo 4: Deploy
1. Clique em **Deploy**
2. Aguarde o build (2-3 minutos)
3. Sua aplicação estará disponível em `https://analise-ia.vercel.app`

## 🗃️ 5. Configurar Banco de Dados

Após o deploy, você precisa executar as migrações do Prisma:

### Opção A: Via Vercel CLI
```bash
# Instalar Vercel CLI
npm i -g vercel

# Fazer login
vercel login

# Executar migrações
vercel env pull .env.local
npx prisma db push
```

### Opção B: Via Dashboard do Banco
1. Acesse o painel do seu banco PostgreSQL
2. Execute este SQL para criar as tabelas:

```sql
-- Tabela BDRs
CREATE TABLE "bdrs" (
    "id" SERIAL PRIMARY KEY,
    "nome" TEXT NOT NULL UNIQUE,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- Tabela Cold Calls
CREATE TABLE "cold_calls" (
    "id" SERIAL PRIMARY KEY,
    "bdrId" INTEGER NOT NULL,
    "prospectNome" TEXT NOT NULL,
    "prospectEmpresa" TEXT NOT NULL,
    "insightComercial" TEXT,
    "warmerScore" INTEGER NOT NULL,
    "reframeScore" INTEGER NOT NULL,
    "rationalDrowningScore" INTEGER NOT NULL,
    "emotionalImpactScore" INTEGER NOT NULL,
    "newWayScore" INTEGER NOT NULL,
    "yourSolutionScore" INTEGER NOT NULL,
    "analiseCompleta" TEXT NOT NULL,
    "pontosAtencao" TEXT NOT NULL,
    "recomendacoes" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    FOREIGN KEY ("bdrId") REFERENCES "bdrs"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Tabela Meetings
CREATE TABLE "meetings" (
    "id" SERIAL PRIMARY KEY,
    "bdrId" INTEGER NOT NULL,
    "dataReuniao" TIMESTAMP(3) NOT NULL,
    "resumo" TEXT NOT NULL,
    "metas" TEXT NOT NULL,
    "warmerScore" INTEGER NOT NULL,
    "reframeScore" INTEGER NOT NULL,
    "rationalDrowningScore" INTEGER NOT NULL,
    "emotionalImpactScore" INTEGER NOT NULL,
    "newWayScore" INTEGER NOT NULL,
    "yourSolutionScore" INTEGER NOT NULL,
    "analiseCompleta" TEXT NOT NULL,
    "pontosAtencao" TEXT NOT NULL,
    "recomendacoes" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    FOREIGN KEY ("bdrId") REFERENCES "bdrs"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
```

## ✅ 6. Verificar Deploy

1. Acesse sua aplicação no Vercel
2. Teste as funcionalidades:
   - Dashboard principal
   - Criação de BDRs
   - Upload de Cold Calls
   - Análise de reuniões

## 🔄 7. Deploy Automático

A partir de agora, qualquer push para a branch `main` no GitHub fará deploy automático no Vercel.

```bash
# Para futuras atualizações
git add .
git commit -m "feat: nova funcionalidade"
git push origin main
```

## 🛠️ Troubleshooting

### Erro de Build
- Verifique se todas as variáveis de ambiente estão configuradas
- Confirme se o banco PostgreSQL está acessível
- Verifique os logs no painel do Vercel

### Erro de Conexão com Banco
- Teste a connection string do banco
- Verifique se o banco aceita conexões externas
- Confirme se as credenciais estão corretas

### Erro da OpenAI API
- Verifique se a chave está válida
- Confirme se tem créditos disponíveis na conta OpenAI
- Teste a chave em outro ambiente

## 📞 Suporte

Se encontrar problemas:
1. Verifique os logs no painel do Vercel
2. Teste localmente com `npm run dev`
3. Verifique as variáveis de ambiente
4. Consulte a documentação do Vercel

---

🎉 **Parabéns!** Sua aplicação de análise de BDRs está no ar!
