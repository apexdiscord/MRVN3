const fs = require('fs');
const Database = require('better-sqlite3');
const { REST } = require('@discordjs/rest');
const { Collection } = require('discord.js');
const { Routes } = require('discord-api-types/v10');

const { debug, token, guildId } = require('../../config.json');

// Connect to the SQLite database
const db = new Database('database.sqlite');
const db2 = new Database('database2.sqlite');

module.exports = {
	name: 'ready',
	once: true,
	async execute(client) {
		console.log(`Logged in as ${client.user.tag}`);

		if (debug == true) {
			// In dev environment, delete all rows to
			// avoid conflicts on bot restart
			db.prepare('DELETE FROM members').run();
			db2.prepare('DELETE FROM members2').run();
			db2.prepare('DELETE FROM members3').run();
			db2.prepare('DELETE FROM members4').run();
		}

		// Delete all registered slash commands. Only useful
		// for debugging, should not be used in production.
		// await client.application.commands.set([]);

		const commands = [];
		const clientID = client.user.id;
		const rest = new REST({ version: 10 }).setToken(token);
		const folders = fs.readdirSync(`${__dirname}/../../commands`);

		client.commands = new Collection();

		// Collect all the commands and their data
		for (const folder of folders) {
			const files = fs.readdirSync(`${__dirname}/../../commands/${folder}`).filter(file => file.endsWith('.js'));

			for (const file of files) {
				const command = require(`../../commands/${folder}/${file}`);

				commands.push(command.data.toJSON());
				client.commands.set(command.data.name, command);
			}
		}

		// Push the commands to Discord
		async () => {
			try {
				if (debug == false) {
					// Assume production and register global commands
					await rest.put(Routes.applicationCommands(clientID), { body: commands });

					console.log('Successfully deployed global slash commands.');
				} else {
					// Assume dev and register guild commands
					await rest.put(Routes.applicationGuildCommands(clientID, guildId), { body: commands });

					console.log('Successfully deployed guild slash commands.');
				}
			} catch (error) {
				if (error) console.log(error);
			}
		};
	},
};
