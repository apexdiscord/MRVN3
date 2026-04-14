const chalk = require('chalk');
const { DateTime } = require('luxon');
const { ActivityType } = require('discord.js');

module.exports = {
	name: 'clientReady',
	once: true,
	async execute(client) {
		console.log(`${chalk.green.bold('[MRVN]')} Discord gateway connection established. Logged in as ${client.user.username}`);

		function updatePresence() {
			const lastDate = DateTime.fromISO('2014-03-18T00:00:00.000Z');

			const daysSinceLastDirective = Math.floor(DateTime.now().diff(lastDate, 'days').days);

			client.user.setActivity(`${daysSinceLastDirective.toLocaleString()} DAYS SINCE LAST DIRECTIVE`, { type: ActivityType.Custom });
		}

		updatePresence();
		setInterval(updatePresence, 1000 * 60 * 60 * 12);
	},
};
