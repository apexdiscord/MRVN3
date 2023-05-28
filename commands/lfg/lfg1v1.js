const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('lfg-1v1')
		.setDescription('This creates a LFG embed')
		.addStringOption(option => option.setName('message').setDescription('This will be your lfg message').setRequired(true))
		.addStringOption(option => option.setName('mic-required').setDescription('Do you require your team to have mic').setRequired(false).addChoices(
			{ name: 'Yes', value: 'Yes' },
			{ name: 'No', value: 'No' },
		))
		.addStringOption(option => option.setName('main-legends').setDescription('What legends do you usually pick').setRequired(false))
		.addStringOption(option => option.setName('gamer-tag').setDescription('Enter your gamer tag').setRequired(false)),
	async execute(interaction) {

		const { options } = interaction;

		const description = options.getString('message');
		const fieldmic = options.getString('mic-required');
		const fieldm = options.getString('main-legends');
		const fieldg = options.getString('gamer-tag');

		const vclink = new ButtonBuilder()
			.setLabel('Join Voice')
			.setStyle(ButtonStyle.Link)
			.setURL('https://discord.com/channels/' + `${interaction.guild.id}` + '/' + `${interaction.member.voice.channel.id}`);

		const micyes = new ButtonBuilder()
			.setCustomId('micyes')
			.setLabel('Mic Required')
			.setStyle(ButtonStyle.Primary);

		const micno = new ButtonBuilder()
			.setCustomId('micno')
			.setLabel('Mic Optional')
			.setStyle(ButtonStyle.Secondary);

		const row = new ActionRowBuilder();
		if (interaction.member.voice.channel) row.addComponents(vclink);
		if (fieldmic == 'Yes') row.addComponents(micyes);
		if (fieldmic == 'No') row.addComponents(micno);

		const embed = new EmbedBuilder()
			.setAuthor({ name: `${interaction.member.displayName} is looking to 1v1`, iconURL: interaction.member.displayAvatarURL({ dynamic: true }) })
			.setDescription(`<@${interaction.member.id}>'s message: ${description}`)
			.setThumbnail('https://cdn.discordapp.com/attachments/1102189428966965299/1102239138507407582/trios.png')
			.setTimestamp()
			.setFooter({ text: 'Read channel pins!', iconURL: 'https://cdn.discordapp.com/attachments/1102189428966965299/1103018038896382012/09204f6a96455580e749454b7449aa82.png' });
		if (fieldm) embed.addFields({ name: '__Main Legends__', value: `${fieldm}`, inline: true });
		if (fieldg) embed.addFields({ name: '__Gamer Tag__', value: `${fieldg}`, inline: true });


		await interaction.reply({ content: 'Your LFG message has been sent below!', ephemeral: true });

		await interaction.channel.send({
			embeds: [embed],
			components: [row],
		});

	},
};
