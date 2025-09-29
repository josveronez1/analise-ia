# 🛠️ Manual de Troubleshooting - Sistema de Análise de BDRs AWS

## 📋 Índice

1. [Deploy de Alterações no Código](#1-deploy-de-alterações-no-código)
2. [Servidor Fora do Ar](#2-servidor-fora-do-ar)
3. [Aplicação Não Inicia](#3-aplicação-não-inicia)
4. [Problemas de Banco de Dados](#4-problemas-de-banco-de-dados)
5. [Problemas de Conectividade](#5-problemas-de-conectividade)
6. [Problemas de Performance](#6-problemas-de-performance)
7. [Backup e Restauração](#7-backup-e-restauração)
8. [Comandos Úteis](#8-comandos-úteis)

---

## 1. Deploy de Alterações no Código

### 1.1 Deploy Manual (Recomendado)

```bash
# 1. Conectar no servidor
ssh -i analise-ia-key.pem ubuntu@54.207.47.161

# 2. Navegar para o projeto
cd analise-ia

# 3. Parar a aplicação atual
pm2 stop analise-ia

# 4. Atualizar código do repositório
git pull origin main

# 5. Instalar novas dependências (se houver)
npm install

# 6. Executar migrações (se houver mudanças no banco)
npx prisma migrate deploy

# 7. Fazer build da aplicação
npm run build

# 8. Reiniciar aplicação
pm2 restart analise-ia

# 9. Verificar status
pm2 status
```

### 1.2 Deploy Automático (Script)

Criar arquivo `deploy.sh` no servidor:

```bash
#!/bin/bash
echo "🚀 Iniciando deploy..."

# Parar aplicação
pm2 stop analise-ia

# Atualizar código
git pull origin main

# Instalar dependências
npm install

# Executar migrações
npx prisma migrate deploy

# Build
npm run build

# Reiniciar
pm2 restart analise-ia

echo "✅ Deploy concluído!"
pm2 status
```

**Para usar:**
```bash
chmod +x deploy.sh
./deploy.sh
```

---

## 2. Servidor Fora do Ar

### 2.1 Verificar Status da Instância EC2

1. **Console AWS → EC2 → Instances**
2. Verificar se status é "Running"
3. Se estiver "Stopped", clicar em "Start instance"

### 2.2 Reconectar via SSH

```bash
# Se não conseguir conectar, verificar IP
# O IP pode ter mudado se a instância foi reiniciada

# Conectar (substitua pelo IP atual)
ssh -i analise-ia-key.pem ubuntu@[IP_ATUAL]

# Verificar se a aplicação está rodando
pm2 status
```

### 2.3 Reiniciar Aplicação

```bash
# Se a aplicação não estiver rodando
cd analise-ia
pm2 start ecosystem.config.js

# Verificar logs se houver problemas
pm2 logs analise-ia
```

### 2.4 Verificar Serviços

```bash
# Verificar se Nginx está rodando
sudo systemctl status nginx

# Se não estiver, iniciar
sudo systemctl start nginx

# Verificar se a aplicação está escutando na porta 3000
netstat -tlnp | grep 3000
```

---

## 3. Aplicação Não Inicia

### 3.1 Verificar Logs

```bash
# Ver logs do PM2
pm2 logs analise-ia

# Ver logs do sistema
sudo journalctl -u nginx -f
```

### 3.2 Problemas Comuns

#### Erro de JSON
```bash
# Limpar cache
rm -rf .next
rm -rf node_modules/.cache

# Fazer novo build
npm run build
```

#### Erro de Porta em Uso
```bash
# Matar processo na porta 3000
sudo pkill -f "next-server"

# Ou encontrar e matar processo específico
sudo lsof -ti:3000 | xargs sudo kill -9
```

#### Erro de Permissões
```bash
# Corrigir permissões do arquivo .env
chmod 600 .env

# Corrigir permissões da chave SSH
chmod 400 analise-ia-key.pem
```

### 3.3 Reinicialização Completa

```bash
# Parar tudo
pm2 stop all
pm2 delete all

# Limpar cache
rm -rf .next
rm -rf node_modules/.cache

# Reinstalar dependências
npm install

# Build
npm run build

# Iniciar novamente
pm2 start ecosystem.config.js
pm2 save
```

---

## 4. Problemas de Banco de Dados

### 4.1 Verificar Conexão

```bash
# Testar conexão com o banco
psql -h analise-ia-db.c7i6s8q2m0pz.sa-east-1.rds.amazonaws.com -U postgres -d analise_ia

# Se não conectar, verificar:
# 1. Security Groups do RDS
# 2. Credenciais no arquivo .env
# 3. Status da instância RDS no console AWS
```

### 4.2 Recriar Tabelas

```bash
# Se as tabelas não existirem
npx prisma migrate dev --name init

# Ou resetar banco (CUIDADO: apaga todos os dados)
npx prisma migrate reset
```

### 4.3 Verificar Migrações

```bash
# Ver status das migrações
npx prisma migrate status

# Aplicar migrações pendentes
npx prisma migrate deploy
```

---

## 5. Problemas de Conectividade

### 5.1 Aplicação Não Acessível

```bash
# Verificar se está escutando na porta correta
netstat -tlnp | grep 3000

# Se estiver apenas em IPv6, forçar IPv4
HOST=0.0.0.0 npm start
```

### 5.2 Nginx com Erro 502

```bash
# Verificar se a aplicação está rodando
pm2 status

# Verificar logs do Nginx
sudo tail -f /var/log/nginx/error.log

# Reiniciar Nginx
sudo systemctl restart nginx
```

### 5.3 Security Groups

1. **Console AWS → EC2 → Security Groups**
2. Verificar regras:
   - SSH (porta 22): Seu IP
   - HTTP (porta 80): 0.0.0.0/0
   - HTTPS (porta 443): 0.0.0.0/0

---

## 6. Problemas de Performance

### 6.1 Aplicação Lenta

```bash
# Verificar uso de recursos
htop

# Verificar logs do PM2
pm2 monit

# Reiniciar aplicação se necessário
pm2 restart analise-ia
```

### 6.2 Banco de Dados Lento

```bash
# Verificar conexões ativas
psql -h analise-ia-db.c7i6s8q2m0pz.sa-east-1.rds.amazonaws.com -U postgres -d analise_ia -c "SELECT * FROM pg_stat_activity;"
```

### 6.3 Limpeza de Logs

```bash
# Limpar logs antigos do PM2
pm2 flush

# Limpar logs do sistema
sudo journalctl --vacuum-time=7d
```

---

## 7. Backup e Restauração

### 7.1 Backup do Banco de Dados

```bash
# Backup manual
pg_dump -h analise-ia-db.c7i6s8q2m0pz.sa-east-1.rds.amazonaws.com -U postgres -d analise_ia > backup_$(date +%Y%m%d_%H%M%S).sql

# Backup automático (criar script)
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump -h analise-ia-db.c7i6s8q2m0pz.sa-east-1.rds.amazonaws.com -U postgres -d analise_ia > /home/ubuntu/backups/backup_$DATE.sql
echo "Backup criado: backup_$DATE.sql"
```

### 7.2 Restaurar Backup

```bash
# Restaurar backup
psql -h analise-ia-db.c7i6s8q2m0pz.sa-east-1.rds.amazonaws.com -U postgres -d analise_ia < backup_20241228_143000.sql
```

### 7.3 Backup do Código

```bash
# Fazer commit das alterações
git add .
git commit -m "Backup antes de alterações"
git push origin main
```

---

## 8. Comandos Úteis

### 8.1 Monitoramento

```bash
# Status da aplicação
pm2 status

# Logs em tempo real
pm2 logs analise-ia --lines 50

# Monitoramento de recursos
pm2 monit

# Informações detalhadas
pm2 show analise-ia
```

### 8.2 Sistema

```bash
# Espaço em disco
df -h

# Uso de memória
free -h

# Processos ativos
ps aux | grep node

# Portas em uso
netstat -tlnp
```

### 8.3 Nginx

```bash
# Status do Nginx
sudo systemctl status nginx

# Reiniciar Nginx
sudo systemctl restart nginx

# Testar configuração
sudo nginx -t

# Logs do Nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### 8.4 Banco de Dados

```bash
# Conectar no banco
psql -h analise-ia-db.c7i6s8q2m0pz.sa-east-1.rds.amazonaws.com -U postgres -d analise_ia

# Listar tabelas
\dt

# Ver estrutura de uma tabela
\d nome_da_tabela

# Sair do psql
\q
```

---

## 🚨 Contatos de Emergência

### Informações Importantes:
- **IP da EC2**: 54.207.47.161
- **Endpoint RDS**: analise-ia-db.c7i6s8q2m0pz.sa-east-1.rds.amazonaws.com
- **Usuário RDS**: postgres
- **Região AWS**: sa-east-1 (São Paulo)

### Arquivos Críticos:
- **Chave SSH**: analise-ia-key.pem
- **Configuração PM2**: ecosystem.config.js
- **Configuração Nginx**: /etc/nginx/sites-available/analise-ia
- **Variáveis de ambiente**: .env

---

## 📞 Checklist de Emergência

Quando algo der errado, siga esta ordem:

1. ✅ **Verificar status da instância EC2** no console AWS
2. ✅ **Conectar via SSH** no servidor
3. ✅ **Verificar se a aplicação está rodando** (`pm2 status`)
4. ✅ **Verificar logs** (`pm2 logs analise-ia`)
5. ✅ **Verificar se Nginx está rodando** (`sudo systemctl status nginx`)
6. ✅ **Verificar conectividade do banco** (teste de conexão)
7. ✅ **Reiniciar serviços** se necessário
8. ✅ **Fazer backup** antes de alterações grandes

---

**🎯 Lembre-se: A maioria dos problemas pode ser resolvida reiniciando a aplicação ou os serviços!**