const moment = require('moment');
const db = require('../../functions/database.js');
const { ButtonStyle, EmbedBuilder, ButtonBuilder, ActionRowBuilder, SlashCommandBuilder } = require('discord.js');

const { setVCLimit, checkBannedWords, checkVoiceChannel, saveCasualLFGPost, vcLinkButtonBuilder, doesUserHaveSlowmode } = require('../../functions/utilities');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('lfg-mixtape')
		.setDescription('Create an LFG prompt for Mixtape.')
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

		const mode = 'Mixtape';
		const description = interaction.options.getString('message');
		const save = interaction.options.getString('save');
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
		await doesUserHaveSlowmode(interaction, slowmodeAmount);

		let slowmodeQuery = 'SELECT timestamp FROM userSlowmode WHERE userID = ?';

		db.query(slowmodeQuery, [interaction.user.id], async (err, slowmodeRow) => {
			if (slowmodeRow.length != 0) {
				if (slowmodeRow[0].timestamp + slowmodeAmount > moment().unix()) {
					return;
				}
			}

			const buttonRow = new ActionRowBuilder();

			if (vcLinkButtonBuilder(interaction) != null) buttonRow.addComponents(vcLinkButtonBuilder(interaction));
			if (micRequired == 'Yes') buttonRow.addComponents(new ButtonBuilder().setCustomId('MicType').setLabel('Mic Required').setStyle(ButtonStyle.Danger).setDisabled(true));
			if (micRequired == 'No') buttonRow.addComponents(new ButtonBuilder().setCustomId('MicType').setLabel('Mic Optional').setStyle(ButtonStyle.Success).setDisabled(true));

			setVCLimit(mode, interaction);

			let playersNeededText = !playersNeeded ? `is looking for a team` : `is looking for ${playersNeeded} more`;

			const lfgMixtapeEmbed = new EmbedBuilder()
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
				lfgMixtapeEmbed.addFields({
					name: '__Playstyle__',
					value: `${playstyle}`,
					inline: true,
				});

			if (mains)
				lfgMixtapeEmbed.addFields({
					name: '__Main(s)__',
					value: `${mains}`,
					inline: true,
				});

			if (gamertag)
				lfgMixtapeEmbed.addFields({
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
					embeds: [lfgMixtapeEmbed],
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
					embeds: [lfgMixtapeEmbed],
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
		});
	},
};
