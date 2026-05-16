const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const playersPath = path.join(__dirname, '../data/players.json');
const rankingPath = path.join(__dirname, '../data/ranking.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('removeplayer')
    .setDescription('Remove um jogador do acompanhamento')
    .addStringOption(opt =>
      opt.setName('riotid')
        .setDescription('Riot ID do jogador (ex: Nome#TAG)')
        .setRequired(true)
    ),
  async execute(interaction) {
    const riotId = interaction.options.getString('riotid');

    const playersData = JSON.parse(fs.readFileSync(playersPath));
    const idx = playersData.players.findIndex(p => p.riotId.toLowerCase() === riotId.toLowerCase());

    if (idx === -1) {
      return interaction.reply(`**${riotId}** não está cadastrado.`);
    }

    const canonicalId = playersData.players[idx].riotId;
    playersData.players.splice(idx, 1);
    fs.writeFileSync(playersPath, JSON.stringify(playersData, null, 2));

    const rankingData = JSON.parse(fs.readFileSync(rankingPath));
    const rIdx = rankingData.ranking.findIndex(r => r.riotId.toLowerCase() === canonicalId.toLowerCase());
    if (rIdx !== -1) {
      rankingData.ranking.splice(rIdx, 1);
      fs.writeFileSync(rankingPath, JSON.stringify(rankingData, null, 2));
    }

    await interaction.reply(`✅ **${canonicalId}** removido do acompanhamento.`);
  }
};
