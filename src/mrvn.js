const chalk = require('chalk');
const dotenv = require('dotenv');
const { loadEvents } = require('./events.js');
const { uptimeConsole } = require('./utilities/misc.js');
const { Client, GatewayIntentBits } = require('discord.js');

dotenv.config({ quiet: true });

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates] });

client
	.login(process.env.DISCORD_TOKEN)
	.then(() => {
		loadEvents(client);
	})
	.catch(err => {
		if (!err.statusText) {
			console.error(chalk.red(`${chalk.bold('[BOT]')} Error logging into Discord: ${err}`));
		} else {
			console.error(chalk.red(`${chalk.bold('[BOT]')} Error logging into Discord: ${err.statusText}`));
		}
	});

uptimeConsole();

module.exports = { client };
