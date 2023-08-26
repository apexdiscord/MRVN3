const Database = require('../../functions/database.js');
const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder().setName('verify').setDescription('Verify your Apex account. Use this command after running /link.'),

	async execute(interaction) {
		await interaction.deferReply({ ephemeral: true });
	},
};
