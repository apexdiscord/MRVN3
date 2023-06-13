const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');

var bannedWords = require('../../data/bannedWords.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('lfg-provisional')
		.setDescription('Creates an LFG prompt for those doing their provisional ranked matches.')
		.addStringOption(option => option.setName('message').setDescription('This will be your lfg message').setRequired(true))
		.addStringOption(option =>
			option
				.setName('mic-required')
				.setDescription('Do you require your team to have mic')
				.setRequired(false)
				.addChoices({ name: 'Yes', value: 'Yes' }, { name: 'No', value: 'No' }),
		)
		.addStringOption(option =>
			option
				.setName('match-number')
				.setDescription('Set your current provisional match number')
				.setRequired(false)
				.addChoices(
					{ name: '0/10', value: '0/10' },
					{ name: '1/10', value: '1/10' },
					{ name: '2/10', value: '2/10' },
					{ name: '3/10', value: '3/10' },
					{ name: '4/10', value: '4/10' },
					{ name: '5/10', value: '5/10' },
					{ name: '6/10', value: '6/10' },
					{ name: '7/10', value: '7/10' },
					{ name: '8/10', value: '8/10' },
					{ name: '9/10', value: '9/10' },
					{ name: '10/10', value: '10/10' },
				),
		)
		.addStringOption(option =>
			option
				.setName('previous-rank')
				.setDescription('Set your game rank from last season')
				.setRequired(false)
				.addChoices(
					{ name: 'Rookie', value: 'Rookie' },
					{ name: 'Bronze', value: 'Bronze' },
					{ name: 'Silver', value: 'Silver' },
					{ name: 'Gold', value: 'Gold' },
					{ name: 'Platinum', value: 'Platinum' },
					{ name: 'Diamond', value: 'Diamond' },
					{ name: 'Master', value: 'Master' },
					{ name: 'Predator', value: 'Predator' },
				),
		)
		.addStringOption(option =>
			option.setName('players-needed').setDescription('How many teammates do you need').setRequired(false).addChoices({ name: '1', value: '1' }, { name: '2', value: '2' }),
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

		const description = options.getString('message');
		const playerno = options.getString('players-needed');
		const fieldmn = options.getString('match-number');
		const fieldmic = options.getString('mic-required');
		const fieldp = options.getString('play-style');
		const fieldm = options.getString('main-legends');
		const fieldg = options.getString('gamer-tag');

		if (interaction.member.voice.channel) {
			var vclink = new ButtonBuilder()
				.setLabel('Join Voice')
				.setStyle(ButtonStyle.Link)
				.setEmoji('🔊')
				.setURL('https://discord.com/channels/' + `${interaction.guild.id}` + '/' + `${interaction.member.voice.channel.id}`);
		} else {
			var vclink = null;
		}

		const micyes = new ButtonBuilder().setCustomId('micyes').setLabel('Mic Required').setStyle(ButtonStyle.Success).setDisabled(true);

		const micno = new ButtonBuilder().setCustomId('micno').setLabel('Mic Optional').setStyle(ButtonStyle.Danger).setDisabled(true);

		const row = new ActionRowBuilder();
		if (interaction.member.voice.channel) row.addComponents(vclink);
		if (fieldmic == 'Yes') row.addComponents(micyes);
		if (fieldmic == 'No') row.addComponents(micno);

		if (bannedWords.some(i => description.toLowerCase().includes(i))) {
			console.log(interaction.member.displayName + ' tried to use a banned word in their LFG message.');

			await interaction.reply({
				content: 'Your LFG message contains a bad word!',
				ephemeral: true,
			});

			return;
		}

		if (fieldm) {
			if (bannedWords.some(i => fieldm.toLowerCase().includes(i))) {
				console.log(`${interaction.member.displayName} (${interaction.member.id}) tried to use a banned word in their LFG message.`);

				await interaction.reply({
					content: 'Your LFG message contains a bad word!',
					ephemeral: true,
				});

				return;
			}
		}

		let playersNeeded = !playerno ? `is looking for a team` : `is looking for ${playerno}`;

		const embed = new EmbedBuilder()
			.setAuthor({ name: `${interaction.member.displayName} ${playersNeeded}`, iconURL: interaction.member.displayAvatarURL({ dynamic: true }) })
			.setDescription(`<@${interaction.member.id}>'s message: ${description}`)
			.setThumbnail('attachment://trios.png')
			.setTimestamp()
			.setFooter({
				text: 'Read channel pins!',
				iconURL: 'attachment://pin.png',
			});
		if (fieldmn) embed.addFields({ name: '__Match Number__', value: `${fieldmn}`, inline: true });
		if (fieldp) embed.addFields({ name: '__Play Style__', value: `${fieldp}`, inline: true });
		if (fieldm) embed.addFields({ name: '__Main Legends__', value: `${fieldm}`, inline: true });
		if (fieldg) embed.addFields({ name: '__Gamer Tag__', value: `${fieldg}`, inline: true });

		await interaction.reply({ content: 'Your LFG message has been sent below!', ephemeral: true });

		if (interaction.member.voice.channel || row.components.length != 0) {
			await interaction.channel.send({
				embeds: [embed],
				components: [row],
				files: [
					{
						attachment: `${__dirname}/../../images/nonRanked/provisional.png`,
						name: 'trios.png',
					},
					{
						attachment: `${__dirname}/../../images/other/pin.png`,
						name: 'pin.png',
					},
				],
			});
		} else {
			await interaction.channel.send({
				embeds: [embed],
				files: [
					{
						attachment: `${__dirname}/../../images/nonRanked/provisional.png`,
						name: 'trios.png',
					},
					{
						attachment: `${__dirname}/../../images/other/pin.png`,
						name: 'pin.png',
					},
				],
			});
		}
	},
};
