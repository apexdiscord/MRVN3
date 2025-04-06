const { SlashCommandBuilder, MessageFlags } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('find')
		.setDescription('Find a user in any VC.')
		.addUserOption(option => option.setName('user').setDescription('The username of the user you want to find.').setRequired(true)),

	async execute(interaction) {
		await interaction.deferReply({ flags: MessageFlags.Ephemeral });
		const user = interaction.options.getUser('user');
		const member = interaction.guild.members.cache.get(user.id);
		const voiceChannel = member.voice.channel;

		await interaction.editReply({ content: `Searching for <@${user.id}>...`, flags: MessageFlags.Ephemeral });

		// If the user is not in a voice chat, send an error message
		if (!voiceChannel) return await interaction.editReply({ content: `<@${member.id}> is not connected to a voice channel.`, flags: MessageFlags.Ephemeral });

		// If the user is in a voice chat, respond with the chat they are in
		await interaction.editReply({ content: `<@${member.id}> is currently in <#${voiceChannel.id}>.`, flags: MessageFlags.Ephemeral });
	},
};
