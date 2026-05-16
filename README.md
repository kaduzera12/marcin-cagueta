# Marcin Cagueta 🤖

Bot de Discord para acompanhar partidas de **League of Legends** entre amigos. Todo dia às 23:59 ele cagueta o resultado da turma: quem jogou, quem não jogou, como foi o desempenho e atualiza o ranking por elo automaticamente.

## O que ele faz

- **Resumo diário às 23:59** — envia automaticamente num canal dedicado com:
  - Quem jogou ranked Solo/Duo e quantas partidas
  - Vitórias, derrotas, campeão e KDA de cada partida
  - Elo atual de cada jogador
  - Para quem não jogou: quantos dias está sem jogar
- **Ranking por elo** — mensagem fixa num canal dedicado, atualizada diariamente com todos os jogadores ordenados por tier e LP
- **Comando `/resumo`** — gera o resumo manualmente para hoje ou ontem
- **Comando `/ranking`** — força atualização do ranking no canal dedicado
- **Comando `/addplayer`** — adiciona um jogador ao acompanhamento
- **Comando `/removeplayer`** — remove um jogador

## Tecnologias

- [Node.js](https://nodejs.org/) + [discord.js](https://discord.js.org/) v14
- [Riot Games API](https://developer.riotgames.com/) — match-v5, league-v4, account-v1
- [node-cron](https://github.com/node-cron/node-cron) — agendamento do resumo diário
- Dados armazenados em JSON local

## Como rodar o seu próprio

### 1. Pré-requisitos

- [Node.js](https://nodejs.org/) 18 ou superior
- Bot criado no [Discord Developer Portal](https://discord.com/developers/applications)
- API Key da [Riot Games](https://developer.riotgames.com) (recomendado: Personal API Key)

### 2. Clone e instale

```bash
git clone https://github.com/kaduzera12/marcin-cagueta.git
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
RANKING_CHANNEL_ID=id_do_canal_ranking
REGION=BR1
```

### 4. Adicione os jogadores

Edite o array `PLAYERS` no arquivo `setup-players.js` com os Riot IDs do seu grupo e execute:

```bash
node setup-players.js
```

### 5. Registre os slash commands

```bash
npm run deploy
```

### 6. Inicie o bot

```bash
npm start
```

Para rodar em produção com reinício automático, use o [PM2](https://pm2.keymetrics.io/):

```bash
npm install -g pm2
pm2 start index.js --name marcin-cagueta
pm2 save
pm2 startup
```

### 7. Convide o bot para seu servidor

```
https://discord.com/oauth2/authorize?client_id=SEU_CLIENT_ID&permissions=274877908992&scope=bot%20applications.commands
```

## Observações

- Apenas partidas **Ranked Solo/Duo** são contabilizadas
- O resumo edita a própria mensagem se gerado mais de uma vez no mesmo dia
- O ranking é baseado no elo real buscado da Riot API, não em pontos acumulados
- A Personal API Key da Riot não expira — ideal para uso contínuo
