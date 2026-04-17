const chalk = require('chalk');
const { MessageFlags, InteractionType } = require('discord.js');

module.exports = {
	name: 'interactionCreate',
	once: false,
	async execute(interaction, client) {
		if (interaction.type === InteractionType.ApplicationCommand) {
			await interaction.deferReply({ flags: MessageFlags.Ephemeral });

			const command = client.commands.get(interaction.commandName);

			if (!command) return;

			try {
				await command.execute(interaction);
				console.log(`${chalk.blue.bold('[MRVN]')} ${interaction.user.username} used /${interaction.commandName}`);
			} catch (error) {
				console.log(error);
			}
		}
	},
};
