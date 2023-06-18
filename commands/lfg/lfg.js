const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const Database = require('better-sqlite3');
const moment = require('moment');
const db3 = new Database(`${__dirname}/../../databases/savedLFGPosts.sqlite`, { verbose: console.log });

var bannedWords = require('../../data/bannedWords.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('lfg')
		.setDescription('Creates an LFG prompt for Battle Royale Trios and Duos.')
		.addStringOption(option =>
			option
				.setName('mode')
				.setDescription("Select which Battle Royale mode you'll be playing.")
				.setRequired(true)
				.addChoices({ name: 'Duos', value: 'Duos' }, { name: 'Trios', value: 'Trios' }),
		)
		.addStringOption(option => option.setName('message').setDescription('Your message for the LFG post.').setRequired(true))
		.addStringOption(option =>
			option
				.setName('save')
				.setDescription('Choose whether to save the data or not')
				.setRequired(true)
				.addChoices({ name: 'Yes', value: 'Yes' }, { name: 'No', value: 'No' }),
		)
		.addStringOption(option =>
			option.setName('players-needed').setDescription('How many teammates do you need?').setRequired(false).addChoices({ name: '1', value: '1' }, { name: '2', value: '2' }),
		)
		.addStringOption(option =>
			option
				.setName('mic-required')
				.setDescription('Do you require your teammates to have mic?')
				.setRequired(false)
				.addChoices({ name: 'Yes', value: 'Yes' }, { name: 'No', value: 'No' }),
		)
		.addStringOption(option =>
			option
				.setName('play-style')
				.setDescription('What is your play style?')
				.setRequired(false)
				.addChoices({ name: 'Aggresive', value: 'Aggressive' }, { name: 'Defensive', value: 'Defensive' }, { name: 'Variable', value: 'Variable' }),
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

		const mode = options.getString('mode');
		const description = options.getString('message');
		const saveoption = options.getString('save');
		const playerno = options.getString('players-needed');
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

		const micyes = new ButtonBuilder().setCustomId('micyes').setLabel('Mic Required').setStyle(ButtonStyle.Danger).setDisabled(true);

		const micno = new ButtonBuilder().setCustomId('micno').setLabel('Mic Optional').setStyle(ButtonStyle.Success).setDisabled(true);

		const row = new ActionRowBuilder();
		if (interaction.member.voice.channel) row.addComponents(vclink);
		if (fieldmic == 'Yes') row.addComponents(micyes);
		if (fieldmic == 'No') row.addComponents(micno);

		if (mode == 'Duos' && interaction.member.voice.channel) {
			// set user limit of current voice channel to 2
			interaction.member.voice.channel.setUserLimit(2);
		} else if (interaction.member.voice.channel) {
			// set user limit of current voice channel to 3
			interaction.member.voice.channel.setUserLimit(3);
		}

		if (bannedWords.some(i => description.toLowerCase().includes(i))) {
			console.log(interaction.member.displayName + ' tried to use a banned word in their LFG message.');

			await interaction.editReply({
				content: 'Your LFG message contains a bad word!',
				ephemeral: true,
			});

			return;
		}

		if (fieldm) {
			if (bannedWords.some(i => fieldm.toLowerCase().includes(i))) {
				console.log(interaction.member.displayName + ' tried to use a banned word in their LFG message.');

				await interaction.editReply({
					content: 'Your LFG message contains a bad word!',
					ephemeral: true,
				});

				return;
			}
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

		await interaction.editReply({
			content: 'Your LFG message has been sent below!',
			ephemeral: true,
		});

		const timestamp = moment().unix();

		if (saveoption === 'Yes') {
			// Store the LFG data in the database
			const stmt = db3.prepare(`
        INSERT OR REPLACE INTO savedPosts (user_id, mode, description, playerno, fieldmic, fieldp, fieldm, fieldg, timestamp)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
			stmt.run(interaction.member.id, mode, description, playerno || '', fieldmic || '', fieldp || '', fieldm || '', fieldg || '', timestamp);

			await interaction.editReply({
				content: 'Your LFG message has been saved and also sent below!',
				ephemeral: true,
			});
		} else {
			await interaction.editReply({
				content: 'Your LFG message has been sent below!',
				ephemeral: true,
			});
		}

		if (interaction.member.voice.channel || row.components.length != 0) {
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
		} else {
			await interaction.channel.send({
				embeds: [embed],
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
		}
	},
};
