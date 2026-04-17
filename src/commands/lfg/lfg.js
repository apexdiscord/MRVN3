const { DateTime } = require('luxon');
const { uptimeText, errorDisplay } = require('../../utilities/misc.js');
const { checkVoiceChannelCategory } = require('../../utilities/lfg.js');
const { MessageFlags, SectionBuilder, ContainerBuilder, ThumbnailBuilder, TextDisplayBuilder, SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('lfg')
		.setDescription('Create a Duos, Trios, or Wildcard LFG Post')
		.addStringOption(option =>
			option
				.setName('gamemode')
				.setDescription('Gamemode for the LFG Post')
				.setRequired(true)
				.addChoices({ name: 'Duos', value: 'duos' }, { name: 'Trios', value: 'trios' }, { name: 'Wildcard', value: 'wildcard' }),
		)
		.addStringOption(option => option.setName('message').setDescription('Any information you want players to know').setRequired(true))
		.addBooleanOption(option => option.setName('save').setDescription('Save this post to reuse with the /repost command! Saving this data will overwrite existing data.').setRequired(false))
		.addIntegerOption(option => option.setName('players-needed').setDescription('Number of players needed').setMinValue(1).setMaxValue(2).setRequired(false))
		.addBooleanOption(option => option.setName('mic-required').setDescription('Do you require teammates to have a microphone to communicate?').setRequired(false))
		.addStringOption(option => option.setName('gamertag').setDescription('Your in-game username').setRequired(false)),

	async execute(interaction) {
		const mode = interaction.options.getString('gamemode');
		const message = interaction.options.getString('message');
		const save = interaction.options.getBoolean('save') ?? false;
		const playersNeeded = interaction.options.getInteger('players-needed') ?? 0;
		const micRequired = interaction.options.getBoolean('mic-required') ?? false;
		const gamertag = interaction.options.getString('gamertag') ?? null;

		console.log(`mode: ${mode}\nmessage: ${message}\nsave: ${save}\nplayersNeeded: ${playersNeeded}\nmicRequired: ${micRequired}\ngamertag: ${gamertag}`);

		if (checkVoiceChannelCategory(interaction.member) == true) {
			await interaction.editReply({
				components: [
					errorDisplay(
						'Invalid Voice Channel',
						`You cannot create an LFG post while in the <#${interaction.member.voice.channel.parentId}> category.\nPlease leave the voice channel or move to an LFG-specific voice channel.`,
						'warning',
					),
				],
				flags: MessageFlags.IsComponentsV2,
			});
		}
	},
};
