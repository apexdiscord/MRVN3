const { ButtonStyle, EmbedBuilder, ButtonBuilder, ActionRowBuilder, SlashCommandBuilder } = require('discord.js');

const { setVCLimit, checkBannedWords, checkVoiceChannel, vcLinkButtonBuilder, doesUserHaveSlowmode } = require('../../functions/utilities.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('lfg-provisional')
		.setDescription('Create an LFG prompt for Ranked Provisional Matches.')
		.addStringOption(option => option.setName('message').setDescription('Enter any information you want others to know.').setRequired(true))
		.addStringOption(option =>
			option
				.setName('match-number')
				.setDescription('How many provisional matches have you completed?')
				.setRequired(true)
				.addChoices(
					{ name: '0/10', value: '0' },
					{ name: '1/10', value: '1' },
					{ name: '2/10', value: '2' },
					{ name: '3/10', value: '3' },
					{ name: '4/10', value: '4' },
					{ name: '5/10', value: '5' },
					{ name: '6/10', value: '6' },
					{ name: '7/10', value: '7' },
					{ name: '8/10', value: '8' },
					{ name: '9/10', value: '9' },
				),
		)
		.addStringOption(option =>
			option
				.setName('previous-rank')
				.setDescription('What rank were you last season?')
				.setRequired(false)
				.addChoices(
					{ name: 'Rookie', value: 'Rookie' },
					{ name: 'Bronze', value: 'Bronze' },
					{ name: 'Silver', value: 'Silver' },
					{ name: 'Gold', value: 'Gold' },
					{ name: 'Platinum', value: 'Platinum' },
					{ name: 'Diamond', value: 'Diamond' },
					{ name: 'Master', value: 'Master' },
					{ name: 'Apex Predator', value: 'Apex Predator' },
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

		const mode = 'Provisional';
		const description = interaction.options.getString('message');
		const matchNumber = interaction.options.getString('match-number');
		const previousRank = interaction.options.getString('previous-rank');
		const playersNeeded = interaction.options.getString('players-needed');
		const micRequired = interaction.options.getString('mic-required');
		const playstyle = interaction.options.getString('playstyle');
		const mains = interaction.options.getString('mains');
		const gamertag = interaction.options.getString('gamertag');

		// Check if any of the manual input fields contain banned words
		if (checkBannedWords(description, interaction) == true) return;
		if (checkBannedWords(mains, interaction) == true) return;
		if (checkBannedWords(gamertag, interaction) == true) return;

		// Check for a slowmode in the channel the interaction is created in.
		// If there is, set that to the slowmode for the LFG post minute 30 seconds
		// so that it is quicker to post an LFG post than to send a channel, but still
		// have a slowmode to prevent people from spamming it
		var slowmodeAmount = interaction.channel.rateLimitPerUser === 0 ? 90 : interaction.channel.rateLimitPerUser - 30;

		// Check if the user has a slowmode. If true, return and don't execute
		// If false, continue with the command and add a slowmode to the user
		if (doesUserHaveSlowmode(interaction, slowmodeAmount) == true) return;

		const buttonRow = new ActionRowBuilder();

		if (vcLinkButtonBuilder(interaction) != null) buttonRow.addComponents(vcLinkButtonBuilder(interaction));
		if (micRequired == 'Yes') buttonRow.addComponents(new ButtonBuilder().setCustomId('MicType').setLabel('Mic Required').setStyle(ButtonStyle.Danger).setDisabled(true));
		if (micRequired == 'No') buttonRow.addComponents(new ButtonBuilder().setCustomId('MicType').setLabel('Mic Optional').setStyle(ButtonStyle.Success).setDisabled(true));

		setVCLimit(mode, interaction);

		let playersNeededText = !playersNeeded ? `is looking for a team` : `is looking for ${playersNeeded} more`;

		const lfgProvisionalEmbed = new EmbedBuilder()
			.setAuthor({
				name: `${interaction.member.displayName} ${playersNeededText}`,
				iconURL: interaction.member.displayAvatarURL({ dynamic: true }),
			})
			.setDescription(`<@${interaction.member.id}>'s Message: ${description}`)
			.setThumbnail(`attachment://Provisional_0${matchNumber}.png`)
			.setTimestamp()
			.setFooter({
				text: 'Read channel pins!',
				iconURL: 'attachment://pin.png',
			});

		if (matchNumber)
			lfgProvisionalEmbed.addFields({
				name: '__Matches Completed__',
				value: `${matchNumber}/10`,
				inline: true,
			});

		if (previousRank)
			lfgProvisionalEmbed.addFields({
				name: '__Previous Rank__',
				value: `${previousRank}`,
				inline: true,
			});

		if (playstyle)
			lfgProvisionalEmbed.addFields({
				name: '__Playstyle__',
				value: `${playstyle}`,
				inline: true,
			});

		if (mains)
			lfgProvisionalEmbed.addFields({
				name: '__Main(s)__',
				value: `${mains}`,
				inline: true,
			});

		if (gamertag)
			lfgProvisionalEmbed.addFields({
				name: '__Gamertag__',
				value: `${gamertag}`,
				inline: true,
			});

		await interaction.editReply({
			content: 'Your LFG message has been posted!',
			ephemeral: true,
		});

		if (buttonRow.components.length == 0) {
			await interaction.channel.send({
				embeds: [lfgProvisionalEmbed],
				files: [
					{
						attachment: `${__dirname}/../../images/ranked/provisional/Provisional_0${matchNumber}.png`,
						name: `Provisional_0${matchNumber}.png`,
					},
					{
						attachment: `${__dirname}/../../images/other/pin.png`,
						name: `pin.png`,
					},
				],
			});
		} else {
			await interaction.channel.send({
				embeds: [lfgProvisionalEmbed],
				components: [buttonRow],
				files: [
					{
						attachment: `${__dirname}/../../images/ranked/provisional/Provisional_0${matchNumber}.png`,
						name: `Provisional_0${matchNumber}.png`,
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
