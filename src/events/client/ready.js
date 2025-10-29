const fs = require('fs');
const chalk = require('chalk');
const { DateTime } = require('luxon');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v10');
const { Collection, ActivityType } = require('discord.js');

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

		// Update presence every 12 hours
		setInterval(updatePresence, 1000 * 60 * 60 * 12);

		// Load and Register Slash Commands
		const commands = [];
		const rest = new REST({ version: 10 }).setToken(process.env.DISCORD_BOT_TOKEN);
		const folders = fs.readdirSync(`${__dirname}/../../commands`);

		client.commands = new Collection();

		for (const folder of folders) {
			const files = fs.readdirSync(`${__dirname}/../../commands/${folder}`).filter(file => file.endsWith('.js'));

			for (const file of files) {
				const command = require(`${__dirname}/../../commands/${folder}/${file}`);

				commands.push(command.data.toJSON());

				client.commands.set(command.data.name, command);

				// Check to see if a command required permission, and set it to true if so
				// if (commandPermission.includes(command.data.name)) command.requiresPermission = true;
			}
		}

		(async () => {
			try {
				// await rest.put(Routes.applicationCommands(client.user.id), { body: [] });
				// await rest.put(Routes.applicationGuildCommands(client.user.id, process.env.GUILD_ID), { body: [] });

				if (process.env.DEBUG == 'false') {
					// Production, register global slash commands
					await rest.put(Routes.applicationCommands(client.user.id), { body: commands });

					console.log(`${chalk.green.bold(`[MRVN]`)} Deployed global slash commands`);
				} else {
					// Development, register guild slash commands
					await rest.put(Routes.applicationGuildCommands(client.user.id, process.env.DEV_GUILD_ID), { body: commands });

					console.log(`${chalk.yellow.bold(`[MRVN]`)} Deployed guild slash commands for dev environment`);
				}
			} catch (error) {
				if (error) console.log(`${chalk.red.bold(`[MRVN]`)} Error pushing commands to Discord: ${chalk.red(error)}`);
			}
		})();
	},
};
