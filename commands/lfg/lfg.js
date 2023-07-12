const { ButtonStyle, EmbedBuilder, ButtonBuilder, ActionRowBuilder, SlashCommandBuilder } = require('discord.js');

const { setVCLimit, checkBannedWords, checkVoiceChannel, saveCasualLFGPost, vcLinkButtonBuilder } = require('../../functions/utilities');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('lfg')
		.setDescription('Create an LFG prompt for Battle Royale Trios and Duos.')
		.addStringOption(option =>
			option.setName('mode').setDescription('Select the mode you want to play.').setRequired(true).addChoices(
				{
					name: 'Duos',
					value: 'Duos',
				},
				{
					name: 'Trios',
					value: 'Trios',
				},
			),
		)
		.addStringOption(option => option.setName('message').setDescription('Enter any information you want others to know.').setRequired(true))
		.addStringOption(option =>
			option.setName('save').setDescription('Choose whether to save your LFG message for future use using /rc.').setRequired(false).addChoices(
				{
					name: 'Yes',
					value: 'Yes',
				},
				{
					name: 'No',
					value: 'No',
				},
			),
		)
		.addStringOption(option =>
			option.setName('players-needed').setDescription('How many teammates do you need?').setRequired(false).addChoices(
				{
					name: '1',
					value: '1',
				},
				{
					name: '2',
					value: '2',
				},
			),
		)
		.addStringOption(option =>
			option.setName('mic-required').setDescription('Do you require teammates to have a mic?').setRequired(false).addChoices(
				{
					name: 'Yes',
					value: 'Yes',
				},
				{
					name: 'No',
					value: 'No',
				},
			),
		)
		.addStringOption(option =>
			option.setName('playstyle').setDescription('What is your playstyle?').setRequired(false).addChoices(
				{
					name: 'Aggressive',
					value: 'Aggressive',
				},
				{
					name: 'Defensive',
					value: 'Defensive',
				},
				{
					name: 'Variable',
					value: 'Variable',
				},
			),
		)
		.addStringOption(option => option.setName('mains').setDescription('What legend(s) do you main?').setRequired(false))
		.addStringOption(option => option.setName('gamertag').setDescription('Enter your gamertag.').setRequired(false)),

	async execute(interaction) {
		await interaction.deferReply({ ephemeral: true });

		// Check to see if they are in a VC that in a category
		// that is not allowed to be edited.
		if (checkVoiceChannel(interaction.member.voice) == true) {
			await interaction.editReply({
				content: `You cannot use this command while in <#${interaction.member.voice.channel.id}>.\nPlease disconnect or move to an LFG voice channel.`,
				ephemeral: true,
			});

			return;
		}

		const mode = interaction.options.getString('mode');
		const description = interaction.options.getString('message');
		const save = interaction.options.getString('save');
		const playersNeeded = interaction.options.getString('players-needed');
		const micRequired = interaction.options.getString('mic-required');
		const playstyle = interaction.options.getString('playstyle');
		const mains = interaction.options.getString('mains');
		const gamertag = interaction.options.getString('gamertag');

		if (checkBannedWords(description, interaction) == true) return;
		if (checkBannedWords(mains, interaction) == true) return;
		if (checkBannedWords(gamertag, interaction) == true) return;

		const buttonRow = new ActionRowBuilder();

		if (vcLinkButtonBuilder(interaction) != null) buttonRow.addComponents(vcLinkButtonBuilder(interaction));
		if (micRequired == 'Yes') buttonRow.addComponents(new ButtonBuilder().setCustomId('MicType').setLabel('Mic Required').setStyle(ButtonStyle.Danger).setDisabled(true));
		if (micRequired == 'No') buttonRow.addComponents(new ButtonBuilder().setCustomId('MicType').setLabel('Mic Optional').setStyle(ButtonStyle.Success).setDisabled(true));

		setVCLimit(mode, interaction);

		let playersNeededText = !playersNeeded ? `is looking for a team` : `is looking for ${playersNeeded} more`;

		const lfgEmbed = new EmbedBuilder()
			.setAuthor({
				name: `${interaction.member.displayName} ${playersNeededText}`,
				iconURL: interaction.member.displayAvatarURL({ dynamic: true }),
			})
			.setDescription(`<@${interaction.member.id}>'s Message: ${description}`)
			.setThumbnail(`attachment://${mode}.png`)
			.setTimestamp()
			.setFooter({
				text: 'Read channel pins!',
				iconURL: 'attachment://pin.png',
			});

		if (playstyle)
			lfgEmbed.addFields({
				name: '__Playstyle__',
				value: `${playstyle}`,
				inline: true,
			});

		if (mains)
			lfgEmbed.addFields({
				name: '__Main(s)__',
				value: `${mains}`,
				inline: true,
			});

		if (gamertag)
			lfgEmbed.addFields({
				name: '__Gamertag__',
				value: `${gamertag}`,
				inline: true,
			});

		if (save == 'Yes') {
			saveCasualLFGPost(interaction, mode, description, playersNeeded, micRequired, playstyle, mains, gamertag);

			await interaction.editReply({
				content: 'Your LFG message has been posted and saved, use the `/rc` command to post it again!',
				ephemeral: true,
			});
		} else {
			await interaction.editReply({
				content: 'Your LFG message has been posted!',
				ephemeral: true,
			});
		}

		if (buttonRow.components.length == 0) {
			await interaction.channel.send({
				embeds: [lfgEmbed],
				files: [
					{
						attachment: `${__dirname}/../../images/nonRanked/${mode}.png`,
						name: `${mode}.png`,
					},
					{
						attachment: `${__dirname}/../../images/other/pin.png`,
						name: `pin.png`,
					},
				],
			});
		} else {
			await interaction.channel.send({
				embeds: [lfgEmbed],
				components: [buttonRow],
				files: [
					{
						attachment: `${__dirname}/../../images/nonRanked/${mode}.png`,
						name: `${mode}.png`,
					},
					{
						attachment: `${__dirname}/../../images/other/pin.png`,
						name: `pin.png`,
					},
				],
			});
		}
	},
};
