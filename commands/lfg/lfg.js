const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('lfg')
		.setDescription('This creates a LFG embed')
		.addStringOption(option =>
			option.setName('mode').setDescription('Select the game mode').setRequired(true).addChoices({ name: 'Duos', value: 'Duos' }, { name: 'Trios', value: 'Trios' }),
		)
		.addStringOption(option => option.setName('message').setDescription('This will be your lfg message').setRequired(true))
		.addStringOption(option =>
			option.setName('players-needed').setDescription('How many teammates do you need').setRequired(false).addChoices({ name: '1', value: '1' }, { name: '2', value: '2' }),
		)
		.addStringOption(option =>
			option
				.setName('mic-required')
				.setDescription('Do you require your team to have mic')
				.setRequired(false)
				.addChoices({ name: 'Yes', value: 'Yes' }, { name: 'No', value: 'No' }),
		)
		.addStringOption(option =>
			option
				.setName('play-style')
				.setDescription('How do you play the matches')
				.setRequired(false)
				.addChoices({ name: 'Aggresive', value: 'Aggressive' }, { name: 'Defensive', value: 'Defensive' }, { name: 'Variable', value: 'Variable' }),
		)
		.addStringOption(option => option.setName('main-legends').setDescription('What legends do you usually pick').setRequired(false))
		.addStringOption(option => option.setName('gamer-tag').setDescription('Enter your gamer tag').setRequired(false)),
	async execute(interaction) {
		const { options } = interaction;

		const mode = options.getString('mode');
		const description = options.getString('message');
		const playerno = options.getString('players-needed');
		const fieldmic = options.getString('mic-required');
		const fieldp = options.getString('play-style');
		const fieldm = options.getString('main-legends');
		const fieldg = options.getString('gamer-tag');

		const vclink = new ButtonBuilder()
			.setLabel('Join Voice')
			.setStyle(ButtonStyle.Link)
			.setURL('https://discord.com/channels/' + `${interaction.guild.id}` + '/' + `${interaction.member.voice.channel.id}`);

		const micyes = new ButtonBuilder().setCustomId('micyes').setLabel('Mic Required').setStyle(ButtonStyle.Primary);

		const micno = new ButtonBuilder().setCustomId('micno').setLabel('Mic Optional').setStyle(ButtonStyle.Secondary);

		const row = new ActionRowBuilder();
		if (interaction.member.voice.channel) row.addComponents(vclink);
		if (fieldmic == 'Yes') row.addComponents(micyes);
		if (fieldmic == 'No') row.addComponents(micno);

		if (mode == 'Duos') {
			// set user limit of current voice channel to 2
			interaction.member.voice.channel.setUserLimit(2);
		} else {
			// set user limit of current voice channel to 3
			interaction.member.voice.channel.setUserLimit(3);
		}

		let playersNeeded = !playerno ? `is looking for a team` : `is looking for ${playerno}`;

		const embed = new EmbedBuilder()
			.setAuthor({
				name: `${interaction.member.displayName} ${playersNeeded}`,
				iconURL: interaction.member.displayAvatarURL({ dynamic: true }),
			})
			.setDescription(`<@${interaction.member.id}>'s message: ${description}`)
			.setThumbnail(`attachment://${mode}.png`)
			.setTimestamp()
			.setFooter({
				text: 'Read channel pins!',
				iconURL: 'attachment://pin.png',
			});
		if (fieldp)
			embed.addFields({
				name: '__Play Style__',
				value: `${fieldp}`,
				inline: true,
			});
		if (fieldm)
			embed.addFields({
				name: '__Main Legends__',
				value: `${fieldm}`,
				inline: true,
			});
		if (fieldg)
			embed.addFields({
				name: '__Gamer Tag__',
				value: `${fieldg}`,
				inline: true,
			});

		await interaction.reply({
			content: 'Your LFG message has been sent below!',
			ephemeral: true,
		});

		await interaction.channel.send({
			embeds: [embed],
			components: [row],
			files: [
				{
					attachment: `${__dirname}/../../images/nonRanked/${mode}.png`,
					name: `${mode}.png`,
				},
				{
					attachment: `${__dirname}/../../images/other/pin.png`,
					name: 'pin.png',
				},
			],
		});
	},
};
