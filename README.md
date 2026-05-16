# Marcin Cagueta — Discord LoL Bot

Bot de Discord para acompanhar partidas de League of Legends entre amigos. Gera um resumo automático diário com vitórias, derrotas e KDA de cada jogador, e mantém um ranking de pontos atualizado.

## Funcionalidades

- `/addplayer Nome#TAG` — Adiciona um jogador ao acompanhamento
- `/removeplayer Nome#TAG` — Remove um jogador
- `/ranking` — Exibe o ranking atual
- Resumo automático às 23:59 (horário de Brasília) no canal configurado

## Pontuação

- **+1 ponto** por vitória
- **-1 ponto** por derrota

## Configuração

### 1. Pré-requisitos

- [Node.js](https://nodejs.org/) 18 ou superior
- Bot criado no [Discord Developer Portal](https://discord.com/developers/applications)
- API Key da [Riot Games](https://developer.riotgames.com)

### 2. Clone o repositório

```bash
git clone https://github.com/seu-usuario/marcin-cagueta.git
cd marcin-cagueta
npm install
```

### 3. Configure o `.env`

Crie um arquivo `.env` na raiz baseado no `.env.example`:

```
RIOT_API_KEY=sua_chave_aqui
DISCORD_TOKEN=token_do_bot
DISCORD_CLIENT_ID=id_da_aplicacao
SUMMARY_CHANNEL_ID=id_do_canal_resumo
REGION=BR1
```

### 4. Registre os slash commands

```bash
npm run deploy
```

### 5. Inicie o bot

```bash
npm start
```

### 6. Convide o bot para seu servidor

Use o link abaixo substituindo `SEU_CLIENT_ID` pelo ID da sua aplicação:

```
https://discord.com/oauth2/authorize?client_id=SEU_CLIENT_ID&permissions=274877908992&scope=bot%20applications.commands
```
