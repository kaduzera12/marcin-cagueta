const { EmbedBuilder } = require('discord.js');
const { readJson, writeJson } = require('./storage');
const path = require('path');

const rankingPath = path.join(__dirname, '../data/ranking.json');
const rankingMsgPath = path.join(__dirname, '../data/ranking-message.json');

const TIER_ORDER = { CHALLENGER: 9, GRANDMASTER: 8, MASTER: 7, DIAMOND: 6, EMERALD: 5, PLATINUM: 4, GOLD: 3, SILVER: 2, BRONZE: 1, IRON: 0 };
const RANK_ORDER = { I: 4, II: 3, III: 2, IV: 1 };

const TIER_PT = {
  CHALLENGER: 'Challenger', GRANDMASTER: 'Grão-mestre', MASTER: 'Mestre',
  DIAMOND: 'Diamante', EMERALD: 'Esmeralda', PLATINUM: 'Platina',
  GOLD: 'Ouro', SILVER: 'Prata', BRONZE: 'Bronze', IRON: 'Ferro'
};

const TIER_EMOJI = {
  CHALLENGER: '🔶', GRANDMASTER: '🔴', MASTER: '🟣',
  DIAMOND: '💎', EMERALD: '💚', PLATINUM: '🩵',
  GOLD: '🟡', SILVER: '⚪', BRONZE: '🟤', IRON: '⬛'
};

const POSITION_EMOJI = ['🥇', '🥈', '🥉'];

function eloScore(entry) {
  if (!entry.tier) return -1;
  return (TIER_ORDER[entry.tier] ?? 0) * 10000 + (RANK_ORDER[entry.rank] ?? 0) * 1000 + (entry.lp ?? 0);
}

function formatElo(entry) {
  if (!entry.tier) return 'Sem ranking';
  const tier = TIER_PT[entry.tier] ?? entry.tier;
  if (['CHALLENGER', 'GRANDMASTER', 'MASTER'].includes(entry.tier)) {
    return `${tier} · ${entry.lp} LP`;
  }
  return `${tier} ${entry.rank} · ${entry.lp} LP`;
}

const DIVIDER = '┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄';

function buildRankingEmbed() {
  const rankingData = readJson(rankingPath, { ranking: [] });
  const sorted = [...rankingData.ranking].sort((a, b) => eloScore(b) - eloScore(a));

  if (sorted.length === 0) {
    return new EmbedBuilder()
      .setTitle('🏆 Ranking — Marcin Cagueta')
      .setDescription('Nenhum jogador cadastrado ainda.')
      .setColor(0xffd700)
      .setTimestamp();
  }

  const lines = sorted.map((p, i) => {
    const pos = POSITION_EMOJI[i] ?? `**${i + 1}.**`;
    const tierEmoji = p.tier ? (TIER_EMOJI[p.tier] ?? '❓') : '❓';
    const elo = formatElo(p);
    let stats = '';
    if (p.wins != null && p.losses != null) {
      const total = p.wins + p.losses;
      const wr = Math.round((p.wins / total) * 100);
      stats = `  ·  ${total}P  ${wr}%W`;
    }
    return `${pos}  **${p.riotId}**\n${tierEmoji}  ${elo}${stats}`;
  });

  const description = lines.join(`\n\n${DIVIDER}\n\n`);

  return new EmbedBuilder()
    .setTitle('🏆 Ranking — Marcin Cagueta')
    .setDescription(description)
    .setColor(0xffd700)
    .setFooter({ text: 'Atualizado em' })
    .setTimestamp();
}

async function updateRankingMessage(client) {
  const channel = await client.channels.fetch(process.env.RANKING_CHANNEL_ID);
  if (!channel) return;

  const embed = buildRankingEmbed();
  const msgData = readJson(rankingMsgPath, { messageId: null });

  if (msgData.messageId) {
    try {
      const msg = await channel.messages.fetch(msgData.messageId);
      await msg.edit({ embeds: [embed] });
      return;
    } catch {
      // mensagem deletada, cria nova
    }
  }

  const sent = await channel.send({ embeds: [embed] });
  msgData.messageId = sent.id;
  writeJson(rankingMsgPath, msgData);
}

module.exports = { updateRankingMessage, eloScore, formatElo };
