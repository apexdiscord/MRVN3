const Database = require('../../functions/database.js');
const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder().setName('verify').setDescription('Verify your Apex account. Use this command after running /link.'),

	async execute(interaction) {
		await interaction.deferReply({ ephemeral: true });

		// select the user account from the api
		// select the linked account form the database
		// if the account matches, start verification

		// check first tracker, api and database match, move onto second tracker
		// check second tracker, api and database match, move onto third tracker
		// check third tracker, api and database match, verification complete

		// FIRST: add the discord id, player id, and platform to specter
		// remove the temp link from temp_linking
		// send an embed, "success!!!!!!"

		// if any of the trackers don't match, send an embed, "verification failed, please try again"
		// ideally, it would be at which tracker the verification failed
		// (if possible? maybe? kinda. a lotta effort :3)
	},
};
