const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const { refreshElo } = require('../utils/refreshElo');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ranking')
    .setDescription('Atualiza o ranking com os elos atuais e exibe no canal de ranking'),
  async execute(interaction) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    await refreshElo(interaction.client);
    await interaction.editReply(`Ranking atualizado! Veja em <#${process.env.RANKING_CHANNEL_ID}>`);
  }
};
