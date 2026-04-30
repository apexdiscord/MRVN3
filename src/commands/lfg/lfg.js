const { DateTime } = require('luxon');
const { uptimeText, errorDisplay, emoteFileName, splitChannelName } = require('../../utilities/misc.js');
const { modeBadge, regionBadge, stitchEmotes, isMicRequired, teammatesNeeded, createVoiceButton, checkVoiceChannelCategory } = require('../../utilities/lfg.js');
const { ButtonStyle, MessageFlags, ButtonBuilder, SectionBuilder, ContainerBuilder, ThumbnailBuilder, TextDisplayBuilder, SlashCommandBuilder } = require('discord.js');

const emotes = require(`../../data/emotes/${emoteFileName(process.env.DEBUG)}.json`);

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

		// TODO: Set Voice Channel Status based on message

		console.log(`save: ${save}`);

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

			return;
		}

		const lfgContainer = new ContainerBuilder()
			.addTextDisplayComponents(new TextDisplayBuilder().setContent(`# ${teammatesNeeded(interaction.user.id, playersNeeded)}`))
			.addTextDisplayComponents(new TextDisplayBuilder().setContent(`### ${regionBadge(splitChannelName(interaction.channel.name, 0))} ${modeBadge(mode)} ${isMicRequired(micRequired)}`))
			.addSectionComponents(
				new SectionBuilder()
					.setButtonAccessory(createVoiceButton(interaction))
					.addTextDisplayComponents(new TextDisplayBuilder().setContent(`**Message from <@${interaction.user.id}>**\n${message}${gamertag ? `\n\n**Gamertag**\n${gamertag}` : ''}`)),
			);

		const reportContainer = new ContainerBuilder().addSectionComponents(
			new SectionBuilder()
				.setButtonAccessory(new ButtonBuilder().setStyle(ButtonStyle.Danger).setLabel('Report Above Post').setCustomId('report_lfg_post').setDisabled(true))
				.addTextDisplayComponents(new TextDisplayBuilder().setContent(`Server Rules, Discord, Respawn, and EA ToS apply.\n-# Help us promote a positive environment by reporting rule breaking behavior.`)),
		);

		await interaction.channel.send({
			components: [lfgContainer, reportContainer],
			flags: MessageFlags.IsComponentsV2,
			allowedMentions: { parse: [] },
		});

		await interaction.editReply({
			content: `${emotes.success} LFG Post Created!`,
		});
	},
};
