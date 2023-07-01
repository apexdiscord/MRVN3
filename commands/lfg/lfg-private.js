const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');

const { checkBannedWordsCustom, checkVoiceChannel } = require('../../functions/utilities.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('lfg-private')
		.setDescription('Create an LFG prompt for Private/Custom Matches.')
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
			option
				.setName('game-mode')
				.setDescription('What is the game mode for the lobby?')
				.setRequired(true)
				.addChoices(
					{ name: 'Battle Royale Trios', value: 'Battle Royale Trios' },
					{ name: 'Battle Royale Duos', value: 'Battle Royale Duos' },
					{ name: 'Team Deathmatch', value: 'Team Deathmatch' },
					{ name: 'Control', value: 'Control' },
					{ name: 'Gun Run', value: 'Gun Run' },
				),
		)
		.addStringOption(option =>
			option
				.setName('map')
				.setDescription('What map is the game being played on?')
				.setRequired(true)
				.addChoices(
					{ name: 'Kings Canyon', value: 'Kings Canyon' },
					{ name: "World's Edge", value: "World's Edge" },
					{ name: 'Olympus', value: 'Olympus' },
					{ name: 'Storm Point', value: 'Storm Point' },
					{ name: 'Broken Moon', value: 'Broken Moon' },
					{ name: 'Party Crasher', value: 'Party Crasher' },
					{ name: 'Phase Runner', value: 'Phase Runner' },
					{ name: 'Habitat 4', value: 'Habitat 4' },
					{ name: 'Hammond Labs', value: 'Hammond Labs' },
					{ name: 'Lava Siphon', value: 'Lava Siphon' },
					{ name: 'Barometer', value: 'Barometer' },
					{ name: 'Skull Town', value: 'Skull Town' },
					{ name: 'Fragment East', value: 'Fragment East' },
					{ name: 'Estates', value: 'Estates' },
				),
		)
		.addStringOption(option =>
			option
				.setName('self-assign-teams')
				.setDescription('Is "Self-Assign Teams" enabled?')
				.setRequired(true)
				.addChoices({ name: 'Yes', value: 'On' }, { name: 'No', value: 'Off' }),
		)
		.addStringOption(option =>
			option
				.setName('aim-assist-override')
				.setDescription('Is "Aim Assist Override" enabled?')
				.setRequired(true)
				.addChoices({ name: 'On', value: 'On' }, { name: 'Off', value: 'Off' }),
		)
		.addStringOption(option =>
			option
				.setName('anonymous-mode')
				.setDescription('Is "Anonymous Mode" enabled?')
				.setRequired(true)
				.addChoices({ name: 'Yes', value: 'On' }, { name: 'No', value: 'Off' }),
		)
		.addStringOption(option =>
			option
				.setName('game-mode-variant')
				.setDescription('The "Game Mode Variant" setting for the custom match.')
				.setRequired(true)
				.addChoices({ name: 'Standard', value: 'Standard' }, { name: 'Tournament', value: 'Tournament' }),
		)
		.addStringOption(option => option.setName('match-code').setDescription('The code for the private match.').setRequired(true)),

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
		const gameMode = interaction.options.getString('game-mode');
		const map = interaction.options.getString('map');
		const selfAssignTeams = interaction.options.getString('self-assign-teams');
		const aimAssistOverride = interaction.options.getString('aim-assist-override');
		const anonymousMode = interaction.options.getString('anonymous-mode');
		const gameModeVarient = interaction.options.getString('game-mode-variant');
		const matchCode = interaction.options.getString('match-code');

		if (checkBannedWordsCustom(description, interaction, false) == true) {
			await interaction.deferReply({ ephemeral: true });

			await interaction.editReply({
				content: 'Your LFG message contains a banned word. Please try again.',
				ephemeral: true,
			});

			return;
		}

		if (checkBannedWordsCustom(matchCode, interaction, false) == true) {
			await interaction.deferReply({ ephemeral: true });

			await interaction.editReply({
				content: 'Your LFG message contains a banned word. Please try again.',
				ephemeral: true,
			});

			return;
		}

		await interaction.deferReply({ ephemeral: false });

		const lfgPrivateEmbed = new EmbedBuilder()
			.setAuthor({
				name: `${interaction.user.tag} is looking for players for a private match`,
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
					name: '__Game Mode__',
					value: `${gameMode}`,
					inline: true,
				},
				{
					name: '__Map__',
					value: `${map}`,
					inline: true,
				},
				{
					name: '__Self-Assign Teams__',
					value: `${selfAssignTeams}`,
					inline: true,
				},
				{
					name: '__Aim Assist Override__',
					value: `${aimAssistOverride}`,
					inline: true,
				},
				{
					name: '__Anonymous Mode__',
					value: `${anonymousMode}`,
					inline: true,
				},
				{
					name: '__Game Mode Variant__',
					value: `${gameModeVarient}`,
					inline: true,
				},
				{
					name: '__Match Code__',
					value: `${matchCode}`,
					inline: true,
				},
			)
			.setFooter({
				text: 'Read channel pins!',
				iconURL: 'attachment://pin.png',
			});

		await interaction.editReply({
			embeds: [lfgPrivateEmbed],
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
