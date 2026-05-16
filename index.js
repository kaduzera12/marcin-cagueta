require('dotenv').config();
const { Client, GatewayIntentBits, Collection, MessageFlags } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { scheduleSummary } = require('./src/scheduler/summary');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.commands = new Collection();

const commandFiles = fs.readdirSync(path.join(__dirname, 'src/commands')).filter(f => f.endsWith('.js'));
for (const file of commandFiles) {
  const command = require(`./src/commands/${file}`);
  client.commands.set(command.data.name, command);
}

client.once('ready', () => {
  console.log(`Bot online: ${client.user.tag}`);
  scheduleSummary(client);
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;
  const command = client.commands.get(interaction.commandName);
  if (!command) return;
  try {
    await command.execute(interaction);
  } catch (err) {
    console.error(err);
    try {
      const msg = { content: 'Ocorreu um erro ao executar esse comando.', flags: MessageFlags.Ephemeral };
      interaction.replied || interaction.deferred
        ? await interaction.editReply(msg)
        : await interaction.reply(msg);
    } catch { /* interaction expirada, ignora */ }
  }
});

client.on('error', err => console.error('Discord client error:', err));
process.on('unhandledRejection', err => console.error('Unhandled rejection:', err));

client.login(process.env.DISCORD_TOKEN);
