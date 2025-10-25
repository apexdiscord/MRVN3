const chalk = require('chalk');
const dotenv = require('dotenv');
const { Client, GatewayIntentBits } = require('discord.js');

dotenv.config();

const client = new Client({ intents: GatewayIntentBits.Guilds });

client.login(process.env.DISCORD_BOT_TOKEN).catch(error => {
	console.log(chalk.red(`${chalk.bold('[BOT]')} Discord Gateway Error: ${error}`));
});

module.exports = client;
