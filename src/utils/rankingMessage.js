const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const rankingPath = path.join(__dirname, '../data/ranking.json');
const rankingMsgPath = path.join(__dirname, '../data/ranking-message.json');

function buildRankingEmbed() {
  const rankingData = JSON.parse(fs.readFileSync(rankingPath));
  const sorted = [...rankingData.ranking].sort((a, b) => b.points - a.points);

  const medals = ['🥇', '🥈', '🥉'];
  const lines = sorted.length > 0
    ? sorted.map((p, i) => {
        const pos = medals[i] ?? `**${i + 1}.**`;
        return `${pos} **${p.riotId}** — ${p.points} pts (${p.wins}V / ${p.losses}D)`;
      })
    : ['Nenhum jogador cadastrado ainda.'];

  return new EmbedBuilder()
    .setTitle('🏆 Ranking — Marcin Cagueta')
    .setDescription(lines.join('\n'))
    .setColor(0xffd700)
    .setFooter({ text: 'Atualizado em' })
    .setTimestamp();
}

async function updateRankingMessage(client) {
  const channel = await client.channels.fetch(process.env.RANKING_CHANNEL_ID);
  if (!channel) return;

  const embed = buildRankingEmbed();
  const msgData = JSON.parse(fs.readFileSync(rankingMsgPath));

  if (msgData.messageId) {
    try {
      const msg = await channel.messages.fetch(msgData.messageId);
      await msg.edit({ embeds: [embed] });
      return;
    } catch {
      // mensagem não existe mais, cria uma nova
    }
  }

  const sent = await channel.send({ embeds: [embed] });
  msgData.messageId = sent.id;
  fs.writeFileSync(rankingMsgPath, JSON.stringify(msgData, null, 2));
}

module.exports = { updateRankingMessage };
