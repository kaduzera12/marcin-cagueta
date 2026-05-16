require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const { generateSummary } = require('./src/scheduler/summary');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once('ready', async () => {
  console.log('Gerando resumo de ontem...');
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  await generateSummary(client, yesterday);
  console.log('Feito.');
  process.exit(0);
});

client.login(process.env.DISCORD_TOKEN);
