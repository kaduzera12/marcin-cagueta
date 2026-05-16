const cron = require('node-cron');
const { EmbedBuilder } = require('discord.js');
const { getMatchIds, getMatch } = require('../riot/api');
const { updateRankingMessage } = require('../utils/rankingMessage');
const fs = require('fs');
const path = require('path');

const playersPath = path.join(__dirname, '../data/players.json');
const rankingPath = path.join(__dirname, '../data/ranking.json');

function getTodayStartTimestamp() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
  return Math.floor(start.getTime() / 1000);
}

async function generateSummary(client) {
  const playersData = JSON.parse(fs.readFileSync(playersPath));
  const rankingData = JSON.parse(fs.readFileSync(rankingPath));

  if (playersData.players.length === 0) return;

  const channel = await client.channels.fetch(process.env.SUMMARY_CHANNEL_ID);
  if (!channel) return;

  const startTime = getTodayStartTimestamp();
  const playerResults = [];

  for (const player of playersData.players) {
    try {
      const matchIds = await getMatchIds(player.puuid, startTime);

      if (matchIds.length === 0) {
        playerResults.push({ riotId: player.riotId, played: false });
        continue;
      }

      const matches = [];
      let wins = 0;
      let losses = 0;

      for (const matchId of matchIds) {
        const match = await getMatch(matchId);
        const participant = match.info.participants.find(p => p.puuid === player.puuid);
        if (!participant) continue;

        const win = participant.win;
        const champion = participant.championName;
        const kills = participant.kills;
        const deaths = participant.deaths;
        const assists = participant.assists;

        if (win) wins++;
        else losses++;

        matches.push({ win, champion, kills, deaths, assists });
      }

      const rankEntry = rankingData.ranking.find(r => r.riotId.toLowerCase() === player.riotId.toLowerCase());
      if (rankEntry) {
        rankEntry.points += wins - losses;
        rankEntry.wins += wins;
        rankEntry.losses += losses;
      }

      playerResults.push({ riotId: player.riotId, played: true, matches, wins, losses });
    } catch (err) {
      console.error(`Erro ao buscar partidas de ${player.riotId}:`, err.message);
      playerResults.push({ riotId: player.riotId, played: false, error: true });
    }
  }

  fs.writeFileSync(rankingPath, JSON.stringify(rankingData, null, 2));

  const today = new Date().toLocaleDateString('pt-BR');
  let description = '';

  for (const result of playerResults) {
    if (result.error) {
      description += `⚠️ **${result.riotId}** — erro ao buscar dados\n\n`;
    } else if (!result.played) {
      description += `❌ **${result.riotId}** — não jogou hoje\n\n`;
    } else {
      description += `✅ **${result.riotId}** — ${result.wins}V ${result.losses}D\n`;
      for (const m of result.matches) {
        const outcome = m.win ? '🟢 Vitória' : '🔴 Derrota';
        description += `　${outcome} · ${m.champion} · ${m.kills}/${m.deaths}/${m.assists}\n`;
      }
      description += '\n';
    }
  }

  const embed = new EmbedBuilder()
    .setTitle(`📋 Resumo do Dia — ${today}`)
    .setDescription(description.trim() || 'Nenhum dado disponível.')
    .setColor(0x5865f2)
    .setTimestamp();

  await channel.send({ embeds: [embed] });
  await updateRankingMessage(client);
}

function scheduleSummary(client) {
  cron.schedule('59 23 * * *', () => {
    generateSummary(client).catch(console.error);
  }, { timezone: 'America/Sao_Paulo' });

  console.log('Resumo diário agendado para 23:59 (America/Sao_Paulo)');
}

module.exports = { scheduleSummary, generateSummary };
