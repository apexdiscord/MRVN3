const fs = require('fs');
const dotenv = require('dotenv');
const Database = require('better-sqlite3');
const { REST } = require('@discordjs/rest');
const { Collection } = require('discord.js');
const { Routes } = require('discord-api-types/v10');

dotenv.config();

// Connect to the SQLite database
const db = new Database('vcOwnerList.sqlite');
const db2 = new Database('memberDecay.sqlite');

module.exports = {
	name: 'ready',
	once: true,
	async execute(client) {
		console.log(`Logged in as ${client.user.tag}`);

		if (process.env.DEBUG == true) {
			// In dev environment, delete all rows to
			// avoid conflicts on bot restart
			// db.prepare('DELETE FROM vcOwnerList').run();
			// db2.prepare('DELETE FROM memberDecay1').run();
			// db2.prepare('DELETE FROM memberDecay2').run();
			// db2.prepare('DELETE FROM memberDecay3').run();
		}

		db.prepare('DELETE FROM vcOwnerList').run();
		db2.prepare('DELETE FROM memberDecay1').run();
		db2.prepare('DELETE FROM memberDecay2').run();
		db2.prepare('DELETE FROM memberDecay3').run();

		const commands = [];
		const rest = new REST({ version: 10 }).setToken(process.env.TOKEN);
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

		// Delete all registered slash commands. Only useful
		// for debugging, should not be used in production.
		// if (process.env.DEBUG == 'true') {
		// 	(async () => {
		// 		await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: [] });
		// 		await rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID), { body: [] });

		//		console.log('Deleted previous slash commands');
		//	})();
		// }

		// Push the commands to Discord
		(async () => {
			try {
				if (process.env.DEBUG == 'false') {
					// Assume production and register global commands
					await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: commands });

					console.log('Successfully deployed global slash commands.');
				} else {
					// Assume dev and register guild commands
					await rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID), { body: commands });

					console.log('Successfully deployed guild slash commands.');
				}
			} catch (error) {
				if (error) console.log(error);
			}
		})();
	},
};
