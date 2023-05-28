const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('lfg-custom')
		.setDescription('This creates a LFG embed')
		.addStringOption(option => option.setName('message').setDescription('This will be your lfg message').setRequired(true))
		.addStringOption(option => option.setName('server-region').setDescription('Server region of the lobby').setRequired(true).addChoices(
			{ name: 'North America', value: 'North America' },
			{ name: 'Europe', value: 'Europe' },
			{ name: 'Oceania', value: 'Oceania' },
			{ name: 'Asia', value: 'Asia' },
			{ name: 'Latin America', value: 'Latin America' },
		))
		.addStringOption(option => option.setName('game-type').setDescription('Select the game type').setRequired(true).addChoices(
			{ name: 'Battle Royale Trios', value: 'Battle Royale Trios' },
			{ name: 'Battle Royale Duos', value: 'Battle Royale Duos' },
			{ name: 'Team Death Match', value: 'Team Death Match' },
			{ name: 'Gun Run', value: 'Gun Run' },
			{ name: 'Control', value: 'Control' },
		))
		.addStringOption(option => option.setName('map').setDescription('Select the map').setRequired(true).addChoices(
			{ name: 'Worlds Edge', value: 'Worlds Edge' },
			{ name: 'Storm Point', value: 'Storm Point' },
			{ name: 'Broken Moon', value: 'Broken Moon' },
			{ name: 'Kings Canyon', value: 'Aggressive' },
			{ name: 'Olympus', value: 'Olympus' },
			{ name: 'Skull Town', value: 'Skull Town' },
			{ name: 'Overflow', value: 'Overflow' },
			{ name: 'Habitat 4', value: 'Habitat 4' },
			{ name: 'Fragment East', value: 'Fragment East' },
			{ name: 'Estates', value: 'Estates' },
			{ name: 'Lava Siphon', value: 'Lava Siphon' },
			{ name: 'Barometer', value: 'Barometer' },
			{ name: 'Caustic Treatment', value: 'Caustic Treatment' },
		))
		.addStringOption(option => option.setName('self-assign-teams').setDescription('Choose the correct option').setRequired(true).addChoices(
			{ name: 'On', value: 'On' },
			{ name: 'Off', value: 'Off' },
		))
		.addStringOption(option => option.setName('aim-assis-override').setDescription('Choose the correct option').setRequired(true).addChoices(
			{ name: 'On', value: 'On' },
			{ name: 'Off', value: 'Off' },
		))
		.addStringOption(option => option.setName('anonymous-mode').setDescription('Choose the correct option').setRequired(true).addChoices(
			{ name: 'On', value: 'On' },
			{ name: 'Off', value: 'Off' },
		))
		.addStringOption(option => option.setName('game-mode-variant').setDescription('Choose the correct option').setRequired(true).addChoices(
			{ name: 'Standard', value: 'Standard' },
			{ name: 'Tournament', value: 'Tournament' },
		))
		.addStringOption(option => option.setName('code').setDescription('The private match code').setRequired(true)),
	async execute(interaction) {

		const { options } = interaction;

		const description = options.getString('message');
		const fieldsr = options.getString('server-region');
		const fieldgt = options.getString('game-type');
		const fieldm = options.getString('map');
		const fieldsat = options.getString('self-assign-teams');
		const fieldaao = options.getString('aim-assist-override');
		const fieldam = options.getString('anonymous-mode');
		const fieldgmv = options.getString('game-mode-variant');
		const fieldc = options.getString('code');

		const embed = new EmbedBuilder()
			.setAuthor({ name: `${interaction.member.displayName} is looking for players for a private match`, iconURL: interaction.member.displayAvatarURL({ dynamic: true }) })
			.setDescription(`<@${interaction.member.id}>'s message: ${description}`)
			.setThumbnail('https://cdn.discordapp.com/attachments/1102189428966965299/1102239138507407582/trios.png')
			.setTimestamp()
			.addFields({ name: '__Server Region__', value: `${fieldsr}`, inline: true })
			.addFields({ name: '__Game Type__', value: `${fieldgt}`, inline: true })
			.addFields({ name: '__Map__', value: `${fieldm}`, inline: true })
			.addFields({ name: '__Self Assign Teams__', value: `${fieldsat}`, inline: true })
			.addFields({ name: '__Aim Assist Override__', value: `${fieldaao}`, inline: true })
			.addFields({ name: '__Anonymous Mode__', value: `${fieldam}`, inline: true })
			.addFields({ name: '__Game Mode Variant__', value: `${fieldgmv}`, inline: true })
			.addFields({ name: '__Code__', value: `${fieldc}`, inline: true })
			.setFooter({ text: 'Read channel pins!', iconURL: 'https://cdn.discordapp.com/attachments/1102189428966965299/1103018038896382012/09204f6a96455580e749454b7449aa82.png' });

		await interaction.reply({ content: 'Your LFG message has been sent below!', ephemeral: true });

		await interaction.channel.send({ embeds: [embed] });

	},
};