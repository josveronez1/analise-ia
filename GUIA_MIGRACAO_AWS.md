# 🚀 Guia Completo de Migração: Vercel → AWS

## Sistema de Análise de Performance de BDRs

---

## 📋 Índice

1. [Seção 1: Limpeza e Preparação do Projeto](#seção-1-limpeza-e-preparação-do-projeto)
2. [Seção 2: Configuração da Infraestrutura na AWS](#seção-2-configuração-da-infraestrutura-na-aws)
3. [Seção 3: Deploy da Aplicação no Servidor EC2](#seção-3-deploy-da-aplicação-no-servidor-ec2)
4. [Seção 4: Acesso à Aplicação](#seção-4-acesso-à-aplicação)
5. [Seção 5: Monitoramento e Manutenção](#seção-5-monitoramento-e-manutenção)

---

## Seção 1: Limpeza e Preparação do Projeto

### 1.1 Remoção de Configurações da Vercel

#### Passo 1.1.1: Remover arquivo vercel.json
```bash
# No terminal, na raiz do projeto:
rm vercel.json
```

#### Passo 1.1.2: Verificar package.json
Seu `package.json` está limpo e não possui configurações específicas da Vercel. Mantenha como está.

#### Passo 1.1.3: Ajustar next.config.js
Seu `next.config.js` está adequado para produção. Mantenha como está.

### 1.2 Ajuste do Prisma

#### Passo 1.2.1: Verificar schema.prisma
✅ **BOM**: Seu `schema.prisma` já está configurado corretamente:
- Usa `provider = "postgresql"`
- Não há referências ao SQLite
- Está pronto para produção

#### Passo 1.2.2: Criar arquivo .env.example
```bash
# Crie um arquivo .env.example na raiz do projeto:
touch .env.example
```

Adicione o seguinte conteúdo ao `.env.example`:
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/analise_ia"

# OpenAI
OPENAI_API_KEY="your_openai_api_key_here"

# Node Environment
NODE_ENV="production"
```

### 1.3 Gerenciamento de Variáveis de Ambiente

#### Passo 1.3.1: Estrutura de arquivos .env
```
projeto/
├── .env.local          # Desenvolvimento local (não commitado)
├── .env.example        # Template para outros desenvolvedores
└── .env                # Produção no servidor (não commitado)
```

#### Passo 1.3.2: Adicionar ao .gitignore
Verifique se seu `.gitignore` contém:
```gitignore
# Environment variables
.env
.env.local
.env.production
.env.development

# AWS
*.pem
```

#### Passo 1.3.3: Segurança das variáveis
- ✅ **NUNCA** commite arquivos `.env` no Git
- ✅ Use `.env.example` como template
- ✅ No servidor EC2, crie o arquivo `.env` manualmente
- ✅ Defina permissões restritivas: `chmod 600 .env`

---

## Seção 2: Configuração da Infraestrutura na AWS

### 2.1 Criação do Banco de Dados (AWS RDS)

#### Passo 2.1.1: Acessar o Console AWS
1. Acesse [console.aws.amazon.com](https://console.aws.amazon.com)
2. Faça login com suas credenciais
3. Certifique-se de estar na região desejada (ex: `us-east-1`)

#### Passo 2.1.2: Criar instância RDS
1. No console AWS, procure por "RDS"
2. Clique em "Create database"
3. Selecione "Standard create"
4. Escolha "PostgreSQL"
5. **Versão**: PostgreSQL 15.4 (recomendada)
6. **Templates**: "Free tier" (para começar)

#### Passo 2.1.3: Configurações da instância
```
DB instance identifier: analise-ia-db
Master username: postgres
Master password: [Crie uma senha forte - anote em local seguro]
DB instance class: db.t3.micro (Free tier)
Storage type: General Purpose SSD (gp2)
Allocated storage: 20 GB
```

#### Passo 2.1.4: Configurações de conectividade
```
VPC: Default VPC
Subnet group: default
Public access: No (CRÍTICO para segurança)
VPC security groups: Create new
New VPC security group name: rds-security-group
Database port: 5432
```

#### Passo 2.1.5: Configurações adicionais
```
Initial database name: analise_ia
Backup retention period: 7 days
Enable encryption: Yes
Monitoring: Disable enhanced monitoring (para economizar)
```

#### Passo 2.1.6: Criar o banco
1. Clique em "Create database"
2. Aguarde a criação (pode levar 5-10 minutos)
3. **ANOTE** o endpoint do banco (ex: `analise-ia-db.xxxxx.us-east-1.rds.amazonaws.com`)

### 2.2 Criação do Servidor da Aplicação (AWS EC2)

#### Passo 2.2.1: Acessar EC2
1. No console AWS, procure por "EC2"
2. Clique em "Launch instance"

#### Passo 2.2.2: Configurar a instância
```
Name: analise-ia-server
AMI: Ubuntu Server 22.04 LTS (Free tier eligible)
Instance type: t2.micro (Free tier)
Key pair: Create new key pair
Key pair name: analise-ia-key
Key pair type: RSA
Private key file format: .pem
```

#### Passo 2.2.3: Baixar chave SSH
1. Clique em "Create key pair"
2. **BAIXE** o arquivo `.pem` e guarde em local seguro
3. **NUNCA** compartilhe ou commite este arquivo

#### Passo 2.2.4: Configurar Security Group
```
Security group name: ec2-security-group
Description: Security group for analise-ia application

Inbound rules:
- Type: SSH, Protocol: TCP, Port: 22, Source: My IP
- Type: HTTP, Protocol: TCP, Port: 80, Source: 0.0.0.0/0
- Type: HTTPS, Protocol: TCP, Port: 443, Source: 0.0.0.0/0

Outbound rules:
- All traffic, All protocols, All ports, Destination: 0.0.0.0/0
```

#### Passo 2.2.5: Configurações de storage
```
Volume type: gp3
Size: 8 GB (Free tier)
Encryption: Enabled
```

#### Passo 2.2.6: Lançar a instância
1. Clique em "Launch instance"
2. Aguarde o status "Running"
3. **ANOTE** o IPv4 Public IP da instância

### 2.3 Conectando EC2 e RDS

#### Passo 2.3.1: Obter Security Group ID da EC2
1. No console EC2, vá em "Security Groups"
2. Encontre "ec2-security-group"
3. **COPIE** o Security Group ID (ex: `sg-xxxxxxxxx`)

#### Passo 2.3.2: Configurar Security Group do RDS
1. No console RDS, vá em "Databases"
2. Clique na instância criada
3. Vá na aba "Connectivity & security"
4. Clique no Security Group (ex: `rds-security-group`)
5. Vá na aba "Inbound rules"
6. Clique em "Edit inbound rules"
7. Adicione nova regra:
```
Type: PostgreSQL
Protocol: TCP
Port: 5432
Source: Custom
Custom: sg-xxxxxxxxx (ID do Security Group da EC2)
Description: Allow EC2 access
```
8. Clique em "Save rules"

---

## Seção 3: Deploy da Aplicação no Servidor EC2

### 3.1 Conexão SSH

#### Passo 3.1.1: Configurar permissões da chave
```bash
# No seu computador local:
chmod 400 analise-ia-key.pem
```

#### Passo 3.1.2: Conectar via SSH
```bash
# Substitua pelo IP público da sua instância EC2:
ssh -i analise-ia-key.pem ubuntu@[IP_PUBLICO_DA_EC2]

# Exemplo:
ssh -i analise-ia-key.pem ubuntu@54.123.45.67
```

### 3.2 Instalação de Dependências

#### Passo 3.2.1: Atualizar sistema
```bash
sudo apt update && sudo apt upgrade -y
```

#### Passo 3.2.2: Instalar Node.js via NVM
```bash
# Instalar NVM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Recarregar perfil
source ~/.bashrc

# Instalar Node.js LTS
nvm install --lts
nvm use --lts
nvm alias default node

# Verificar instalação
node --version
npm --version
```

#### Passo 3.2.3: Instalar Git
```bash
sudo apt install git -y
```

#### Passo 3.2.4: Instalar PM2
```bash
npm install -g pm2
```

#### Passo 3.2.5: Instalar PostgreSQL client (para testes)
```bash
sudo apt install postgresql-client -y
```

### 3.3 Clone e Configuração do Projeto

#### Passo 3.3.1: Clonar repositório
```bash
# Clone seu repositório (substitua pela URL do seu repo):
git clone https://github.com/seu-usuario/analise-ia.git
cd analise-ia
```

#### Passo 3.3.2: Instalar dependências
```bash
npm install
```

#### Passo 3.3.3: Criar arquivo .env
```bash
# Criar arquivo .env
nano .env
```

Adicione o seguinte conteúdo (substitua pelos valores reais):
```env
# Database - Substitua pelos valores do seu RDS
DATABASE_URL="postgresql://postgres:SUA_SENHA@analise-ia-db.xxxxx.us-east-1.rds.amazonaws.com:5432/analise_ia"

# OpenAI
OPENAI_API_KEY="sua_chave_openai_aqui"

# Node Environment
NODE_ENV="production"
```

Salve o arquivo: `Ctrl + X`, depois `Y`, depois `Enter`

#### Passo 3.3.4: Configurar permissões do .env
```bash
chmod 600 .env
```

### 3.4 Execução das Migrações

#### Passo 3.4.1: Testar conexão com banco
```bash
# Teste a conexão (substitua pelos valores reais):
psql -h analise-ia-db.xxxxx.us-east-1.rds.amazonaws.com -U postgres -d analise_ia
# Digite a senha quando solicitado
# Digite \q para sair
```

#### Passo 3.4.2: Executar migrações
```bash
# Gerar cliente Prisma
npx prisma generate

# Executar migrações
npx prisma migrate deploy
```

### 3.5 Build e Execução

#### Passo 3.5.1: Build da aplicação
```bash
npm run build
```

#### Passo 3.5.2: Configurar PM2
```bash
# Criar arquivo de configuração do PM2
nano ecosystem.config.js
```

Adicione o seguinte conteúdo:
```javascript
module.exports = {
  apps: [{
    name: 'analise-ia',
    script: 'npm',
    args: 'start',
    cwd: '/home/ubuntu/analise-ia',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
}
```

#### Passo 3.5.3: Iniciar aplicação com PM2
```bash
# Iniciar aplicação
pm2 start ecosystem.config.js

# Salvar configuração do PM2
pm2 save

# Configurar PM2 para iniciar no boot
pm2 startup
# Execute o comando que aparecer na tela (será algo como):
# sudo env PATH=$PATH:/home/ubuntu/.nvm/versions/node/v20.x.x/bin /home/ubuntu/.nvm/versions/node/v20.x.x/lib/node_modules/pm2/bin/pm2 startup systemd -u ubuntu --hp /home/ubuntu
```

#### Passo 3.5.4: Verificar status
```bash
# Ver status da aplicação
pm2 status

# Ver logs
pm2 logs analise-ia

# Ver logs em tempo real
pm2 logs analise-ia --lines 50
```

---

## Seção 4: Acesso à Aplicação

### 4.1 Encontrar DNS Público

#### Passo 4.1.1: No console AWS
1. Vá em EC2 → Instances
2. Selecione sua instância
3. Na aba "Details", copie o "Public IPv4 address"

#### Passo 4.1.2: Testar acesso
```bash
# No navegador, acesse:
http://[IP_PUBLICO_DA_EC2]:3000

# Exemplo:
http://54.123.45.67:3000
```

### 4.2 Configurar Proxy Reverso (Nginx) - OPCIONAL

#### Passo 4.2.1: Instalar Nginx
```bash
sudo apt install nginx -y
```

#### Passo 4.2.2: Configurar Nginx
```bash
sudo nano /etc/nginx/sites-available/analise-ia
```

Adicione:
```nginx
server {
    listen 80;
    server_name [IP_PUBLICO_DA_EC2];

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

#### Passo 4.2.3: Ativar configuração
```bash
sudo ln -s /etc/nginx/sites-available/analise-ia /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

Agora você pode acessar via: `http://[IP_PUBLICO_DA_EC2]` (sem porta)

### 4.3 Verificar Logs e Depuração

#### Passo 4.3.1: Logs da aplicação
```bash
# Ver logs do PM2
pm2 logs analise-ia

# Ver logs do sistema
sudo journalctl -u nginx -f
```

#### Passo 4.3.2: Verificar status dos serviços
```bash
# Status do PM2
pm2 status

# Status do Nginx
sudo systemctl status nginx

# Status da aplicação
curl http://localhost:3000
```

---

## Seção 5: Monitoramento e Manutenção

### 5.1 Comandos Úteis do PM2

```bash
# Reiniciar aplicação
pm2 restart analise-ia

# Parar aplicação
pm2 stop analise-ia

# Ver monitoramento em tempo real
pm2 monit

# Ver informações detalhadas
pm2 show analise-ia
```

### 5.2 Backup do Banco de Dados

```bash
# Backup manual (execute no servidor EC2)
pg_dump -h analise-ia-db.xxxxx.us-east-1.rds.amazonaws.com -U postgres -d analise_ia > backup_$(date +%Y%m%d_%H%M%S).sql
```

### 5.3 Atualizações da Aplicação

```bash
# No servidor EC2:
cd /home/ubuntu/analise-ia
git pull origin main
npm install
npm run build
pm2 restart analise-ia
```

### 5.4 Monitoramento de Recursos

```bash
# Ver uso de CPU e memória
htop

# Ver espaço em disco
df -h

# Ver logs do sistema
sudo journalctl -f
```

---

## 🎯 Checklist Final

- [ ] Arquivo `vercel.json` removido
- [ ] Arquivo `.env.example` criado
- [ ] Instância RDS PostgreSQL criada
- [ ] Instância EC2 Ubuntu criada
- [ ] Security Groups configurados corretamente
- [ ] Aplicação clonada no servidor
- [ ] Arquivo `.env` configurado no servidor
- [ ] Migrações executadas
- [ ] Aplicação buildada
- [ ] PM2 configurado e rodando
- [ ] Aplicação acessível via navegador
- [ ] Logs funcionando
- [ ] Backup configurado

---

## 🚨 Troubleshooting Comum

### Erro de conexão com banco
```bash
# Verificar se o Security Group do RDS permite acesso da EC2
# Verificar se a DATABASE_URL está correta
# Testar conexão manual: psql -h [endpoint] -U postgres -d analise_ia
```

### Aplicação não inicia
```bash
# Verificar logs: pm2 logs analise-ia
# Verificar se todas as dependências estão instaladas
# Verificar se o arquivo .env existe e tem as variáveis corretas
```

### Erro 502 Bad Gateway (com Nginx)
```bash
# Verificar se a aplicação está rodando: pm2 status
# Verificar logs do Nginx: sudo journalctl -u nginx
# Verificar configuração do Nginx: sudo nginx -t
```

---

## 📞 Suporte

Se encontrar problemas durante a migração:

1. Verifique os logs: `pm2 logs analise-ia`
2. Teste a conectividade: `curl http://localhost:3000`
3. Verifique os Security Groups no console AWS
4. Confirme se todas as variáveis de ambiente estão corretas

**Parabéns! Sua aplicação agora está rodando em uma infraestrutura profissional na AWS! 🎉**
