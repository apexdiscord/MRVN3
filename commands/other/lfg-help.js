const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder().setName('lfg-help').setDescription('Shows the help menu for the LFG command'),

	async execute(interaction) {
		await interaction.deferReply({ ephemeral: true });

		const helpEmbed = new EmbedBuilder()
			.setTitle('MRVN³ LFG - Help')
			.setDescription('Please send all your suggestions and feedback to <@542736472155881473> to help improve the bot!')
			.addFields([
				{
					name: `Kick - </kick:1118231336394694664>`,
					value: 'To use the kick command, you must have been the first person to join a VC. Simply type `/kick` followed by the username of the person you want to kick. Multiple kicks will eventually lead to a timeout.',
				},
				{
					name: `Casual LFG`,
					value: '</lfg:1118231336394694656>\n</lfg-1v1:1118231336394694657>\n</lfg-ltm:1118231336394694658>\n</lfg-mixtape:1118231336394694659>',
					inline: true,
				},
				{
					name: `Ranked LFG`,
					value: '</lfg-ranked:1118231336394694662>\n</lfg-provisional:1118231336394694661>',
					inline: true,
				},
				{
					name: `Other LFG`,
					value: '</lfg-private:1118231336394694660>\n</lfg-tournament:1118231336394694663>',
					inline: true,
				},
			])
			.setImage('https://i.sdcore.dev/6kr02g8lu.gif')
			.setFooter({ text: 'Click any of the command links to use a command!' });

		await interaction.editReply({ embeds: [helpEmbed] });
	},
};
