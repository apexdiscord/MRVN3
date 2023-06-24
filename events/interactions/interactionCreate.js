const chalk = require('chalk');
const Database = require('better-sqlite3');
const { InteractionType } = require('discord.js');

const db_vcOwnerList = new Database(`${__dirname}/../../databases/vcOwnerList.sqlite`);

module.exports = {
	name: 'interactionCreate',
	once: false,
	async execute(interaction, client) {
		if (interaction.type === InteractionType.ApplicationCommand) {
			const command = client.commands.get(interaction.commandName);

			if (!command) return;

			const hasPermission = !command.requiresPermission || db_vcOwnerList.prepare(`SELECT * FROM vcOwnerList WHERE id = ?`).get(interaction.user.id);

			if (hasPermission) {
				// The user running the command has permission as either they are the owner of the voice channel or the command does not require permission to run
				try {
					await command.execute(interaction, client);
				} catch (error) {
					console.log(chalk.bold.red(`BOT: Error running /${command.data.name}. ${error}`));

					await interaction.deferReply({ ephemeral: true });

					await interaction.editReply({
						content: 'There was an error while executing this command!',
						ephemeral: true,
					});
				}
			} else {
				// If the user is not in a voice channel, reply with an error. This should only happen on commands where the commands requires permission to run
				if (!interaction.member.voice.channel) {
					await interaction.deferReply({ ephemeral: true });

					await interaction.editReply({
						content: 'You must be in a voice channel to use this command.',
						ephemeral: true,
					});

					return;
				}

				await interaction.deferReply({ ephemeral: true });

				await interaction.editReply({
					content: 'You do not have permission to use this command.',
					ephemeral: true,
				});
			}
		}
	},
};
