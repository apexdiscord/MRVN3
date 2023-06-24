const fs = require('fs');
const chalk = require('chalk');
const Database = require('better-sqlite3');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v10');
const { Collection, ActivityType } = require('discord.js');

const commandPermission = ['kick'];

const db_vcOwnerList = new Database(`${__dirname}/../../databases/vcOwnerList.sqlite`);
const db_memberDecay = new Database(`${__dirname}/../../databases/memberDecay.sqlite`);

module.exports = {
	name: 'ready',
	once: true,
	async execute(client) {
		console.log(chalk.bold.green(`BOT: Logged in as ${client.user.tag}`));

		// Set bot status to "Watching your games."
		client.user.setActivity('your games.', { type: ActivityType.Watching });

		// Delete all entries from vcOwnerList and memberDecay
		// tables on restart to prevent duplicate or ghost entries
		db_vcOwnerList.prepare('DELETE FROM vcOwnerList').run();
		db_memberDecay.prepare('DELETE FROM memberDecay1').run();
		db_memberDecay.prepare('DELETE FROM memberDecay2').run();
		db_memberDecay.prepare('DELETE FROM memberDecay3').run();

		// Set up the command library
		const commands = [];
		const rest = new REST({ version: 10 }).setToken(process.env.TOKEN);
		const folders = fs.readdirSync(`${__dirname}/../../commands`);

		client.commands = new Collection();

		// Collect command data
		for (const folder of folders) {
			const files = fs.readdirSync(`${__dirname}/../../commands/${folder}`).filter(file => file.endsWith('.js'));

			for (const file of files) {
				const command = require(`${__dirname}/../../commands/${folder}/${file}`);

				commands.push(command.data.toJSON());

				client.commands.set(command.data.name, command);

				// Check to see if a command required permission, and set it to true if so
				if (commandPermission.includes(command.data.name)) command.requiresPermission = true;
			}
		}

		// Push the commands to Discord
		(async () => {
			try {
				if (process.env.DEBUG == 'false') {
					// Production, register global slash commands
					await rest.put(Routes.applicationCommands(client.user.id), { body: commands });

					console.log(chalk.bold.green('BOT: Deployed global slash commands.'));
				} else {
					// Development, register guild slash commands
					await rest.put(Routes.applicationGuildCommands(client.user.id, process.env.GUILD_ID), { body: commands });

					console.log(chalk.bold.yellow('BOT: Deployed guild slash commands for development environment.'));
				}
			} catch (error) {
				if (error) console.log(chalk.bold.red(`BOT: ${error}`));
			}
		})();
	},
};
