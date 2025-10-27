const chalk = require('chalk');
const { DateTime } = require('luxon');
const { ActivityType } = require('discord.js');

module.exports = {
	name: 'clientReady',
	once: true,

	execute(client) {
		console.log(`${chalk.green.bold('[MRVN]')} Logged in as ${chalk.cyan(client.user.username)}`);

		function updatePresence() {
			// Calculate amount of days since March 18th, 2014
			const launchDate = DateTime.fromISO('2014-03-18');
			const today = DateTime.now();

			const daysSinceLaunch = Math.floor(today.diff(launchDate, 'days').days).toLocaleString();

			client.user.setActivity(`${daysSinceLaunch} DAYS SINCE LAST DIRECTIVE`, { type: ActivityType.Custom });

			console.log(`${chalk.green.bold('[MRVN]')} Updated bot presence`);
		}

		updatePresence();

		// Update every 12 hours
		setInterval(updatePresence, 1000 * 60 * 60 * 12);
	},
};
