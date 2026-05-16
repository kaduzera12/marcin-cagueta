const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const { updateRankingMessage } = require('../utils/rankingMessage');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ranking')
    .setDescription('Atualiza o ranking no canal de ranking'),
  async execute(interaction) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    await updateRankingMessage(interaction.client);
    await interaction.editReply(`Ranking atualizado! Veja em <#${process.env.RANKING_CHANNEL_ID}>`);
  }
};
