const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

var bannedWords = require('../../data/bannedWords.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('lfg-1v1')
		.setDescription('Creates an LFG prompt for 1v1s.')
		.addStringOption(option => option.setName('message').setDescription('This will be your lfg message').setRequired(true))
		.addStringOption(option =>
			option
				.setName('mic-required')
				.setDescription('Do you require your team to have mic')
				.setRequired(false)
				.addChoices({ name: 'Yes', value: 'Yes' }, { name: 'No', value: 'No' }),
		)
		.addStringOption(option => option.setName('main-legends').setDescription('What legends do you usually pick').setRequired(false))
		.addStringOption(option => option.setName('gamer-tag').setDescription('Enter your gamer tag').setRequired(false)),
	async execute(interaction) {
		await interaction.deferReply({ ephemeral: true });

		if (
			interaction.member.voice.channel &&
			(interaction.member.voice.channel.parentId == process.env.GEN_CATEGORY || interaction.member.voice.channel.parentId == process.env.EVENT_CATEGORY)
		) {
			await interaction.editReply({
				content: `You cannot use this command while in <#${interaction.member.voice.channel.id}>. Please disconnect or move to an LFG voice channel.`,
				ephemeral: true,
			});

			return;
		}

		const { options } = interaction;

		const description = options.getString('message');
		const fieldmic = options.getString('mic-required');
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
			console.log(`${interaction.member.displayName} (${interaction.member.id}) tried to use a banned word in their LFG message.`);

			await interaction.editReply({
				content: 'Your LFG message contains a bad word!',
				ephemeral: true,
			});

			return;
		}

		if (fieldm) {
			if (bannedWords.some(i => fieldm.toLowerCase().includes(i))) {
				console.log(`${interaction.member.displayName} (${interaction.member.id}) tried to use a banned word in their LFG message.`);

				await interaction.editReply({
					content: 'Your LFG message contains a bad word!',
					ephemeral: true,
				});

				return;
			}
		}

		const embed = new EmbedBuilder()
			.setAuthor({
				name: `${interaction.member.displayName} is looking to 1v1`,
				iconURL: interaction.member.displayAvatarURL({ dynamic: true }),
			})
			.setDescription(`<@${interaction.member.id}>'s message: ${description}`)
			.setThumbnail('attachment://1v1.png')
			.setTimestamp()
			.setFooter({
				text: 'Read channel pins!',
				iconURL: 'attachment://pin.png',
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

		await interaction.editReply({
			content: 'Your LFG message has been sent below!',
			ephemeral: true,
		});

		if (interaction.member.voice.channel) {
			// set the user limit of the channel the user is in to 2
			interaction.member.voice.channel.setUserLimit(2);
		}

		if (interaction.member.voice.channel || row.components.length != 0) {
			await interaction.channel.send({
				embeds: [embed],
				components: [row],
				files: [
					{
						attachment: `${__dirname}/../../images/nonRanked/1v1.png`,
						name: '1v1.png',
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
						attachment: `${__dirname}/../../images/nonRanked/1v1.png`,
						name: '1v1.png',
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
