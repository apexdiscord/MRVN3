const fs = require('fs');
const { REST } = require('@discordjs/rest');
const { Collection } = require('discord.js');
const { Routes } = require('discord-api-types/v10');

const { debug, token, guildId } = require('../../config.json');

module.exports = {
	name: 'ready',
	once: true,
	execute(client) {
		// Register local/global slash commands
		const commands = [];
		const clientID = client.user.id;
		const rest = new REST({ version: 10 }).setToken(token);
		const folders = fs.readdirSync(`${__dirname}/../../commands`);

		client.commands = new Collection();

		for (const folder of folders) {
			const files = fs.readdirSync(`${__dirname}/../../commands/${folder}`).filter(file => file.endsWith('.js'));

			for (const file of files) {
				const command = require(`../../commands/${folder}/${file}`);

				commands.push(command.data);
				client.commands.set(command.data.name, command);
			}
		}

		// Push the commands to Discord
		(async () => {
			try {
				if (debug == false) {
					// If debug is disabled, assume production
					// bot and register global slash commands
					await rest.put(Routes.applicationCommands(clientID), { body: commands });

					console.log(`[>> Successfully registered global slash commands <<]`);
				} else {
					// If debug is enabled, assume dev environment
					// and only register slash commands for dev build
					await rest.put(Routes.applicationGuildCommands(clientID, guildId), { body: commands });

					console.log(`[>> Successfully registered local slash commands <<]`);
				}
			} catch (error) {
				if (error) console.log(error);
			}
		})();
	},
};
