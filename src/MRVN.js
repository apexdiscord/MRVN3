const chalk = require('chalk');
const dotenv = require('dotenv');
const { Client, GatewayIntentBits } = require('discord.js');

const { loadEvents } = require('./events.js');

dotenv.config({ quiet: true });

const client = new Client({ intents: GatewayIntentBits.Guilds });

client
	.login(process.env.DISCORD_BOT_TOKEN)
	.then(() => {
		loadEvents(client);
	})
	.catch(error => {
		console.log(`${chalk.red.bold('[MRVN]')} Discord Gateway Error: ${chalk.red(error)}`);
	});

module.exports = { client };
