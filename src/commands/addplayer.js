const { SlashCommandBuilder } = require('discord.js');
const { getAccountByRiotId } = require('../riot/api');
const fs = require('fs');
const path = require('path');

const playersPath = path.join(__dirname, '../data/players.json');
const rankingPath = path.join(__dirname, '../data/ranking.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('addplayer')
    .setDescription('Adiciona um jogador ao acompanhamento')
    .addStringOption(opt =>
      opt.setName('riotid')
        .setDescription('Riot ID do jogador (ex: Nome#TAG)')
        .setRequired(true)
    ),
  async execute(interaction) {
    await interaction.deferReply();
    const riotId = interaction.options.getString('riotid');
    const [gameName, tagLine] = riotId.split('#');

    if (!gameName || !tagLine) {
      return interaction.editReply('Formato inválido. Use: Nome#TAG');
    }

    const playersData = JSON.parse(fs.readFileSync(playersPath));
    if (playersData.players.find(p => p.riotId.toLowerCase() === riotId.toLowerCase())) {
      return interaction.editReply(`**${riotId}** já está cadastrado.`);
    }

    try {
      const account = await getAccountByRiotId(gameName, tagLine);
      const canonicalId = `${account.gameName}#${account.tagLine}`;

      playersData.players.push({
        riotId: canonicalId,
        puuid: account.puuid
      });
      fs.writeFileSync(playersPath, JSON.stringify(playersData, null, 2));

      const rankingData = JSON.parse(fs.readFileSync(rankingPath));
      if (!rankingData.ranking.find(r => r.riotId.toLowerCase() === canonicalId.toLowerCase())) {
        rankingData.ranking.push({ riotId: canonicalId, points: 0, wins: 0, losses: 0 });
        fs.writeFileSync(rankingPath, JSON.stringify(rankingData, null, 2));
      }

      await interaction.editReply(`✅ **${canonicalId}** adicionado ao acompanhamento!`);
    } catch {
      await interaction.editReply('Jogador não encontrado. Verifique o Riot ID e tente novamente.');
    }
  }
};
