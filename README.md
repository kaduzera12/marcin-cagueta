# Marcin Cagueta 🤖

Bot de Discord para acompanhar partidas de **League of Legends Ranked Solo/Duo** entre amigos. Todo dia às 23:59 ele cagueta o resultado da turma: quem jogou, quem não jogou, como foi o desempenho e mantém um ranking por elo atualizado automaticamente.

## Funcionalidades

### Resumo diário automático (23:59)
- Enviado automaticamente num canal dedicado todos os dias
- Para quem **jogou**: vitórias, derrotas, campeão e KDA de cada partida, elo atual
- Para quem **não jogou**: elo atual e há quantos dias está sem jogar ranked
- Se o resumo já foi gerado no dia (via comando), ele **edita a mensagem existente** em vez de criar uma nova

### Ranking por elo
- Mensagem fixa num canal dedicado, ordenada por tier e LP reais
- Atualizada automaticamente junto com o resumo diário
- Exibe emoji por tier (Ferro → Challenger) e divisão

### Comandos slash

| Comando | Descrição |
|---|---|
| `/resumo hoje` | Gera o resumo das partidas de hoje |
| `/resumo ontem` | Gera o resumo das partidas de ontem |
| `/ranking` | Busca o elo atual de todos e atualiza o canal de ranking |
| `/addplayer Nome#TAG` | Adiciona um jogador ao acompanhamento |
| `/removeplayer Nome#TAG` | Remove um jogador |

## Estrutura do projeto

```
marcin-cagueta/
├── src/
│   ├── commands/
│   │   ├── addplayer.js       # Adiciona jogador
│   │   ├── removeplayer.js    # Remove jogador
│   │   ├── ranking.js         # Atualiza ranking
│   │   └── resumo.js          # Gera resumo manual
│   ├── scheduler/
│   │   └── summary.js         # Cron 23:59 + lógica de resumo
│   ├── riot/
│   │   └── api.js             # Wrapper da Riot Games API
│   ├── utils/
│   │   ├── rankingMessage.js  # Embed e edição do ranking
│   │   ├── refreshElo.js      # Busca e salva elo atual de todos
│   │   └── storage.js         # readJson/writeJson com auto-criação
│   ├── data/                  # Gerado em runtime, não versionado
│   │   ├── players.json       # Jogadores cadastrados e PUUIDs
│   │   ├── ranking.json       # Elo atual de cada jogador
│   │   ├── ranking-message.json     # ID da mensagem do ranking no Discord
│   │   ├── summary-messages.json    # IDs das mensagens de resumo por data
│   │   └── processed-dates.json     # Datas já processadas
│   └── deploy-commands.js     # Registra slash commands no Discord
├── setup-players.js           # Popula players.json com os jogadores
├── index.js                   # Entry point do bot
├── .env.example               # Modelo de variáveis de ambiente
└── package.json
```

## Como rodar o seu próprio

### 1. Pré-requisitos

- [Node.js](https://nodejs.org/) 18 ou superior
- Bot criado no [Discord Developer Portal](https://discord.com/developers/applications)
- [Personal API Key](https://developer.riotgames.com) da Riot Games (não expira)

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
SUMMARY_CHANNEL_ID=id_do_canal_de_resumo
RANKING_CHANNEL_ID=id_do_canal_de_ranking
REGION=BR1
```

> Para pegar os IDs dos canais no Discord: Configurações → Avançado → Modo Desenvolvedor → clique com botão direito no canal → Copiar ID.

### 4. Adicione os jogadores

Edite o array `PLAYERS` no arquivo `setup-players.js` com os Riot IDs do seu grupo e execute:

```bash
node setup-players.js
```

Isso cria os arquivos `src/data/players.json` e `src/data/ranking.json`.

### 5. Registre os slash commands

```bash
npm run deploy
```

Só precisa rodar uma vez (ou quando adicionar novos comandos).

### 6. Inicie o bot

```bash
npm start
```

### 7. Convide o bot para o seu servidor

```
https://discord.com/oauth2/authorize?client_id=SEU_CLIENT_ID&permissions=274877908992&scope=bot%20applications.commands
```

---

## Produção com PM2

Para manter o bot rodando 24/7 com reinício automático:

```bash
npm install -g pm2
pm2 start index.js --name marcin-cagueta
pm2 save
pm2 startup
```

---

## Manutenção

### Renovar a API Key

Com a **Personal API Key** da Riot, a chave não expira. Caso precise trocar:

```bash
# Acesse a VPS
ssh usuario@seu-servidor

# Edite o .env
nano ~/marcin-cagueta/.env

# Recadastre os jogadores com a nova chave
node ~/marcin-cagueta/setup-players.js

# Reinicie o bot
pm2 restart marcin-cagueta
```

### Adicionar ou remover jogadores

Use os comandos `/addplayer` e `/removeplayer` direto no Discord, ou edite `setup-players.js` e rode novamente.

---

## Observações

- Apenas partidas **Ranked Solo/Duo** (fila 420) são consideradas — Flex e outras filas são ignoradas
- O ranking é baseado no **elo real** buscado da Riot API, não em pontos acumulados
- O resumo **edita a própria mensagem** caso seja gerado mais de uma vez no mesmo dia
- Os arquivos em `src/data/` são gerados em runtime e não são versionados no git
