const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');

const { checkBannedWordsCustom, checkVoiceChannel } = require('../../functions/utilities.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('lfg-tournament')
		.setDescription('Create an LFG prompt for Tournaments.')
		.addStringOption(option => option.setName('message').setDescription('Enter any information you want others to know.').setRequired(true))
		.addStringOption(option =>
			option
				.setName('region')
				.setDescription('What region is the lobby in?')
				.setRequired(true)
				.addChoices(
					{ name: 'North America', value: 'North America' },
					{ name: 'Europe', value: 'Europe' },
					{ name: 'Oceania', value: 'Oceania' },
					{ name: 'Asia', value: 'Asia' },
					{ name: 'Latin America', value: 'Latin America' },
				),
		)
		.addStringOption(option =>
			option.setName('players-needed').setDescription('How many teammates do you need?').setRequired(true).addChoices(
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
			option
				.setName('highest-rank')
				.setDescription('What is your highest rank in-game?')
				.setRequired(true)
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
			option
				.setName('minimum-preferred-rank')
				.setDescription('What rank do you prefer teammates to be?')
				.setRequired(true)
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
		.addStringOption(option => option.setName('self-mains').setDescription('What legend(s) do you main?').setRequired(true))
		.addStringOption(option => option.setName('preferred-teammate-mains').setDescription('What legend(s) do you prefer your teammates to be?').setRequired(true))
		.addStringOption(option =>
			option
				.setName('platform')
				.setDescription('What platform are you playing on?')
				.setRequired(true)
				.addChoices({ name: 'PC', value: 'PC' }, { name: 'Control', value: 'Console' }),
		)
		.addStringOption(option => option.setName('gamertag').setDescription('Enter your gamertag.').setRequired(true))
		.addStringOption(option => option.setName('tournament-name').setDescription('What is the name of the tournament?').setRequired(true))
		.addStringOption(option => option.setName('tournament-date').setDescription('When is the tournament?').setRequired(true)),

	async execute(interaction) {
		// Check to see if they are in a VC that in a category
		// that is not allowed to be edited.
		if (checkVoiceChannel(interaction.member.voice) == true) {
			await interaction.deferReply({ ephemeral: true });

			await interaction.editReply({
				content: `You cannot use this command while in <#${interaction.member.voice.channel.id}>.\nPlease disconnect or move to an LFG voice channel.`,
				ephemeral: true,
			});

			return;
		}

		const description = interaction.options.getString('message');
		const serverRegion = interaction.options.getString('region');
		const playersNeeded = interaction.options.getString('players-needed');
		const highestRank = interaction.options.getString('highest-rank');
		const teamRank = interaction.options.getString('minimum-preferred-rank');
		const mains = interaction.options.getString('self-mains');
		const preferredMains = interaction.options.getString('preferred-teammate-mains');
		const platform = interaction.options.getString('platform');
		const gamertag = interaction.options.getString('gamertag');
		const tournamentName = interaction.options.getString('tournament-name');
		const tournamentDate = interaction.options.getString('tournament-date');

		if (
			checkBannedWordsCustom(description, interaction, false) == true ||
			checkBannedWordsCustom(mains, interaction, false) == true ||
			checkBannedWordsCustom(preferredMains, interaction, false) == true ||
			checkBannedWordsCustom(gamertag, interaction, false) == true ||
			checkBannedWordsCustom(tournamentName, interaction, false) == true ||
			checkBannedWordsCustom(tournamentDate, interaction, false) == true
		) {
			await interaction.deferReply({ ephemeral: true });

			await interaction.editReply({
				content: 'Your LFG message contains a banned word. Please try again.',
				ephemeral: true,
			});

			return;
		}

		await interaction.deferReply({ ephemeral: false });

		const lfgTournamentEmbed = new EmbedBuilder()
			.setAuthor({
				name: `${interaction.user.tag} is looking for teammates for a tournament`,
				iconURL: interaction.member.displayAvatarURL({ dynamic: true }),
			})
			.setDescription(`${description}`)
			.setThumbnail('attachment://base.png')
			.setTimestamp()
			.addFields(
				{
					name: '__Server Region__',
					value: `${serverRegion}`,
					inline: true,
				},
				{
					name: '__Players Needed__',
					value: `${playersNeeded}`,
					inline: true,
				},
				{
					name: '__Highest Rank__',
					value: `${highestRank}`,
					inline: true,
				},
				{
					name: '__Minimum Preferred Rank__',
					value: `${teamRank}`,
					inline: true,
				},
				{
					name: '__Mains__',
					value: `${mains}`,
					inline: true,
				},
				{
					name: '__Preferred Team Mains__',
					value: `${preferredMains}`,
					inline: true,
				},
				{
					name: '__Platform__',
					value: `${platform}`,
					inline: true,
				},
				{
					name: '__Gamertag__',
					value: `${gamertag}`,
					inline: true,
				},
				{
					name: '__Tournament Name__',
					value: `${tournamentName}`,
					inline: true,
				},
				{
					name: '__Tournament Date__',
					value: `${tournamentDate}`,
					inline: true,
				},
			)
			.setFooter({
				text: 'Read channel pins!',
				iconURL: 'attachment://pin.png',
			});

		await interaction.editReply({
			embeds: [lfgTournamentEmbed],
			files: [
				{
					attachment: `${__dirname}/../../images/nonRanked/base.png`,
					name: 'base.png',
				},
				{
					attachment: `${__dirname}/../../images/other/pin.png`,
					name: 'pin.png',
				},
			],
		});
	},
};
