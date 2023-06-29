const { ButtonStyle, ButtonBuilder, ActionRowBuilder, SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const { setVCLimit, checkBannedWords, saveCasualLFGPost, checkVoiceChannel, vcLinkButtonBuilder } = require('../../functions/utilities.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('lfg-1v1')
		.setDescription('Create an LFG prompt for 1v1ing someone in the Firing Range.')
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

		const description = interaction.options.getString('message');
		const save = interaction.options.getString('save');
		const micRequired = interaction.options.getString('mic-required');
		const mains = interaction.options.getString('mains');
		const gamertag = interaction.options.getString('gamertag');

		if (checkBannedWords(description, interaction) == true) return;
		if (checkBannedWords(mains, interaction) == true) return;
		if (checkBannedWords(gamertag, interaction) == true) return;

		const buttonRow = new ActionRowBuilder();

		if (vcLinkButtonBuilder(interaction) != null) buttonRow.addComponents(vcLinkButtonBuilder(interaction));
		if (micRequired == 'Yes') buttonRow.addComponents(new ButtonBuilder().setCustomId('MicType').setLabel('Mic Required').setStyle(ButtonStyle.Danger).setDisabled(true));
		if (micRequired == 'No') buttonRow.addComponents(new ButtonBuilder().setCustomId('MicType').setLabel('Mic Optional').setStyle(ButtonStyle.Success).setDisabled(true));

		setVCLimit('1v1', interaction);

		const lfg1v1Embed = new EmbedBuilder()
			.setAuthor({
				name: `${interaction.member.displayName} is looking to 1v1`,
				iconURL: interaction.member.displayAvatarURL({ dynamic: true }),
			})
			.setDescription(`<@${interaction.member.id}>'s Message: ${description}`)
			.setThumbnail(`attachment://1v1.png`)
			.setTimestamp()
			.setFooter({
				text: 'Read channel pins!',
				iconURL: 'attachment://pin.png',
			});

		if (mains)
			lfg1v1Embed.addFields({
				name: '__Main(s)__',
				value: `${mains}`,
				inline: true,
			});

		if (gamertag)
			lfg1v1Embed.addFields({
				name: '__Gamertag__',
				value: `${gamertag}`,
				inline: true,
			});

		if (save == 'Yes') {
			saveCasualLFGPost(interaction, '1v1', description, null, micRequired, null, mains, gamertag);

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
				embeds: [lfg1v1Embed],
				files: [
					{
						attachment: `${__dirname}/../../images/nonRanked/1v1.png`,
						name: `1v1.png`,
					},
					{
						attachment: `${__dirname}/../../images/other/pin.png`,
						name: `pin.png`,
					},
				],
			});
		} else {
			await interaction.channel.send({
				embeds: [lfg1v1Embed],
				components: [buttonRow],
				files: [
					{
						attachment: `${__dirname}/../../images/nonRanked/1v1.png`,
						name: `1v1.png`,
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