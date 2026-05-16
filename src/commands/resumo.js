const { SlashCommandBuilder } = require('discord.js');
const { generateSummary } = require('../scheduler/summary');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('resumo')
    .setDescription('Gera o resumo de um dia manualmente')
    .addStringOption(opt =>
      opt.setName('dia')
        .setDescription('hoje ou ontem (padrão: hoje)')
        .addChoices(
          { name: 'hoje', value: 'hoje' },
          { name: 'ontem', value: 'ontem' }
        )
    ),
  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const dia = interaction.options.getString('dia') ?? 'hoje';
    const targetDate = new Date();
    if (dia === 'ontem') targetDate.setDate(targetDate.getDate() - 1);

    await generateSummary(interaction.client, targetDate);
    await interaction.editReply(`Resumo de **${dia}** gerado em <#${process.env.SUMMARY_CHANNEL_ID}>!`);
  }
};
