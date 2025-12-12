const chalk = require('chalk');
const { InteractionType } = require('discord.js');

module.exports = {
	name: 'interactionCreate',
	once: false,

	async execute(interaction, client) {
		if (!interaction.isCommand()) return;

		if (interaction.type === InteractionType.ApplicationCommand) {
			await interaction.deferReply();

			const command = client.commands.get(interaction.commandName);

			try {
				await command.execute(interaction);

				console.log(
					`${chalk.blue.bold('[MRVN_INTERACTION]')} ${chalk.bold(`/${interaction.commandName}`)} used by ${interaction.user.username} in #${interaction.channel.name}`,
				);
			} catch (err) {
				console.error(`${chalk.blue.red('[MRVN_INTERACTION]')} Interaction error using ${chalk.bold(`/${interaction.commandName}`)}: ${chalk.red(err)}`);
			}
		}
	},
};
