const cron = require('node-cron');
const { EmbedBuilder } = require('discord.js');
const { getMatchIds, getMatch, getRankedStats } = require('../riot/api');
const { updateRankingMessage, formatElo } = require('../utils/rankingMessage');
const { readJson, writeJson } = require('../utils/storage');
const path = require('path');

const playersPath = path.join(__dirname, '../data/players.json');
const rankingPath = path.join(__dirname, '../data/ranking.json');
const processedPath = path.join(__dirname, '../data/processed-dates.json');
const summaryMsgPath = path.join(__dirname, '../data/summary-messages.json');

function getDayTimestamps(date) {
  const start = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0);
  const end = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59);
  return {
    startTime: Math.floor(start.getTime() / 1000),
    endTime: Math.floor(end.getTime() / 1000),
    dateStr: date.toLocaleDateString('pt-BR'),
    dateKey: start.toISOString().slice(0, 10),
  };
}

async function sendOrEditSummary(channel, embed, dateKey) {
  const summaryMessages = readJson(summaryMsgPath, {});

  if (summaryMessages[dateKey]) {
    try {
      const msg = await channel.messages.fetch(summaryMessages[dateKey]);
      await msg.edit({ embeds: [embed] });
      return;
    } catch {
      // mensagem deletada, cria nova
    }
  }

  const sent = await channel.send({ embeds: [embed] });
  summaryMessages[dateKey] = sent.id;
  writeJson(summaryMsgPath, summaryMessages);
}

async function generateSummary(client, targetDate = new Date()) {
  const playersData = readJson(playersPath, { players: [] });
  const rankingData = readJson(rankingPath, { ranking: [] });
  const processedData = readJson(processedPath, { dates: [] });

  if (playersData.players.length === 0) return;

  const channel = await client.channels.fetch(process.env.SUMMARY_CHANNEL_ID);
  if (!channel) return;

  const { startTime, endTime, dateStr, dateKey } = getDayTimestamps(targetDate);
  const alreadyProcessed = processedData.dates.includes(dateKey);
  const playerResults = [];

  for (const player of playersData.players) {
    try {
      const ranked = await getRankedStats(player.puuid);
      const rankEntry = rankingData.ranking.find(r => r.riotId.toLowerCase() === player.riotId.toLowerCase());
      if (rankEntry && ranked) {
        rankEntry.tier = ranked.tier;
        rankEntry.rank = ranked.rank;
        rankEntry.lp = ranked.leaguePoints;
      } else if (rankEntry) {
        rankEntry.tier = null;
        rankEntry.rank = null;
        rankEntry.lp = null;
      }

      const matchIds = await getMatchIds(player.puuid, startTime, endTime);

      if (matchIds.length === 0) {
        playerResults.push({ riotId: player.riotId, played: false, rankEntry });
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
        if (win) wins++; else losses++;
        matches.push({
          win,
          champion: participant.championName,
          kills: participant.kills,
          deaths: participant.deaths,
          assists: participant.assists,
        });
      }

      playerResults.push({ riotId: player.riotId, played: true, matches, wins, losses, rankEntry });
    } catch (err) {
      console.error(`Erro ao buscar dados de ${player.riotId}:`, err.message);
      playerResults.push({ riotId: player.riotId, played: false, error: true });
    }
  }

  writeJson(rankingPath, rankingData);

  if (!alreadyProcessed) {
    processedData.dates.push(dateKey);
    writeJson(processedPath, processedData);
  }

  await updateRankingMessage(client);

  let description = '';
  for (const result of playerResults) {
    if (result.error) {
      description += `⚠️ **${result.riotId}** — erro ao buscar dados\n\n`;
    } else if (!result.played) {
      const elo = result.rankEntry ? formatElo(result.rankEntry) : 'Sem ranking';
      description += `❌ **${result.riotId}** — não jogou · ${elo}\n\n`;
    } else {
      const elo = result.rankEntry ? formatElo(result.rankEntry) : 'Sem ranking';
      description += `✅ **${result.riotId}** — ${result.wins}V ${result.losses}D · ${elo}\n`;
      for (const m of result.matches) {
        const outcome = m.win ? '🟢 Vitória' : '🔴 Derrota';
        description += `　${outcome} · ${m.champion} · ${m.kills}/${m.deaths}/${m.assists}\n`;
      }
      description += '\n';
    }
  }

  const embed = new EmbedBuilder()
    .setTitle(`📋 Resumo do Dia — ${dateStr}`)
    .setDescription(description.trim() || 'Nenhum dado disponível.')
    .setColor(0x5865f2)
    .setTimestamp();

  await sendOrEditSummary(channel, embed, dateKey);
}

function scheduleSummary(client) {
  cron.schedule('59 23 * * *', () => {
    generateSummary(client).catch(console.error);
  }, { timezone: 'America/Sao_Paulo' });

  console.log('Resumo diário agendado para 23:59 (America/Sao_Paulo)');
}

module.exports = { scheduleSummary, generateSummary };
