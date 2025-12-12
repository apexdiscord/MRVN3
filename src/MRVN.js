const chalk = require('chalk');
const { Client, GatewayIntentBits } = require('discord.js');

const { loadEvents } = require('./events.js');

const client = new Client({ intents: GatewayIntentBits.Guilds });

client
	.login(Bun.env.DISCORD_BOT_TOKEN)
	.then(() => {
		loadEvents(client);
	})
	.catch(error => {
		console.log(`${chalk.red.bold('[MRVN_BOT]')} Discord Gateway Error: ${chalk.red(error)}`);
	});

module.exports = { client };
