const fs = require('fs');
const chalk = require('chalk');
const { DateTime } = require('luxon');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v10');
const { Collection, ActivityType } = require('discord.js');

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

		// Register slash commands
		const commands = [];
		const clientID = client.user.id;
		const rest = new REST({ version: 10 }).setToken(process.env.DISCORD_TOKEN);
		const folders = fs.readdirSync(`${__dirname}/../../commands`);

		client.commands = new Collection();

		for (const folder of folders) {
			const files = fs.readdirSync(`${__dirname}/../../commands/${folder}`).filter(file => file.endsWith('.js'));

			for (const file of files) {
				const command = require(`../../commands/${folder}/${file}`);

				commands.push(command.data.toJSON());
				client.commands.set(command.data.name, command);
			}
		}

		// Push the commands to Discord
		(async () => {
			if (process.env.DEBUG == 'false') {
				// If debug is disabled, assume production
				// bot and register global slash commands
				await rest.put(Routes.applicationCommands(clientID), { body: commands });

				console.log(`${chalk.green.bold('[MRVN]')} Successfully registered global slash commands`);
			} else {
				// // Delete all guild-base commands
				// await rest
				// 	.put(Routes.applicationGuildCommands(clientID, process.env.DEV_SERVER), { body: [] })
				// 	.then(() => console.log('Successfully deleted all guild commands.'))
				// 	.catch(console.error);

				// // Delete all global commands
				// await rest
				// 	.put(Routes.applicationCommands(clientID), { body: [] })
				// 	.then(() => console.log('Successfully deleted all application commands.'))
				// 	.catch(console.error);

				// If debug is enabled, assume dev environment
				// and only register slash commands for dev build
				await rest.put(Routes.applicationGuildCommands(clientID, process.env.DEV_SERVER), { body: commands });

				console.log(`${chalk.yellow.bold('[MRVN]')} Successfully registered local slash commands`);
			}
		})();
	},
};
