const { SlashCommandBuilder } = require('discord.js');
const Database = require('../../functions/database.js');

module.exports = {
	data: new SlashCommandBuilder().setName('unlink').setDescription('Unlink your linked Apex account.'),

	async execute(interaction) {
		await interaction.deferReply({ ephemeral: true });

		const discordID = interaction.user.id;

		Database.query('SELECT COUNT(*) AS count FROM specter WHERE discordID = ?', [discordID], async (err, row) => {
			if (err) console.log(err);

			if (row[0]['count'] >= 1) {
				console.log('delete linked account');

				Database.query('DELETE FROM specter WHERE discordID = ?', [discordID], async (err, row) => {
					if (err) console.log(err);

					console.log('deleted :P');

					interaction.editReply('ur linked account has been removed xo');
				});
			} else {
				console.log('no linked account found');

				interaction.editReply('u dont have a linked account!! type `/link` to link ur account :3');
			}
		});
	},
};
