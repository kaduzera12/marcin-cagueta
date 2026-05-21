const { getRankedStats } = require('../riot/api');
const { updateRankingMessage } = require('./rankingMessage');
const { readJson, writeJson } = require('./storage');
const path = require('path');

const playersPath = path.join(__dirname, '../data/players.json');
const rankingPath = path.join(__dirname, '../data/ranking.json');

async function refreshElo(client) {
  const playersData = readJson(playersPath, { players: [] });
  const rankingData = readJson(rankingPath, { ranking: [] });

  for (const player of playersData.players) {
    try {
      const ranked = await getRankedStats(player.puuid);
      const entry = rankingData.ranking.find(r => r.riotId.toLowerCase() === player.riotId.toLowerCase());
      if (!entry) continue;
      if (ranked) {
        entry.tier = ranked.tier;
        entry.rank = ranked.rank;
        entry.lp = ranked.leaguePoints;
        entry.wins = ranked.wins;
        entry.losses = ranked.losses;
      } else {
        entry.tier = null;
        entry.rank = null;
        entry.lp = null;
        entry.wins = null;
        entry.losses = null;
      }
    } catch (err) {
      console.error(`Erro ao atualizar elo de ${player.riotId}:`, err.message);
    }
  }

  writeJson(rankingPath, rankingData);
  await updateRankingMessage(client);
}

module.exports = { refreshElo };
