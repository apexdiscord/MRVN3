const Database = require('better-sqlite3');
const { InteractionType } = require('discord.js');

// Connect to the SQLite database
const db = new Database('database.sqlite');

module.exports = {
	name: 'interactionCreate',
	once: false,
	async execute(interaction, client) {
		if (interaction.type === InteractionType.ApplicationCommand) {
			const command = client.commands.get(interaction.commandName);

			if (!command) return;

			const memberId = interaction.member.id;
			const hasPermission = !command.requiresPermission || db.prepare('SELECT id FROM members WHERE id = ?').get(memberId);

			if (hasPermission) {
				try {
					await command.execute(interaction);
				} catch (error) {
					console.error(error);
					await interaction.reply({
						content: 'There was an error while executing this command!',
						ephemeral: true,
					});
				}
			} else {
				await interaction.reply({
					content: 'You do not have permission to use this command.',
					ephemeral: true,
				});
			}
		}
	},
};
