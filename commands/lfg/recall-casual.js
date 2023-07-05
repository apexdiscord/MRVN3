const Database = require('better-sqlite3');
const { ButtonStyle, ButtonBuilder, ActionRowBuilder, SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const { setVCLimit, checkVoiceChannel, vcLinkButtonBuilder } = require('../../functions/utilities.js');
const db_savedLFGPosts = new Database(`${__dirname}/../../databases/savedLFGPosts.sqlite`);

module.exports = {
	data: new SlashCommandBuilder().setName('rc').setDescription('Recall your saved casual LFG post. These posts are deleted after they have been saved for 28 days.'),

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

		// Retrieve the saved LFG data from the database
		const savedPostData = db_savedLFGPosts.prepare(`SELECT * FROM casualLFG WHERE user_id = ?`).get(interaction.user.id);

		// If there is no saved post, return an error
		if (!savedPostData) {
			await interaction.editReply({
				content: 'You have not saved an LFG post. Use an LFG command and select `Yes` for the "save" option to save a post!',
				ephemeral: true,
			});

			return;
		}

		await interaction.editReply({
			content: 'Posted your saved LFG post below.',
			ephemeral: true,
		});

		const buttonRow = new ActionRowBuilder();

		if (vcLinkButtonBuilder(interaction) != null) buttonRow.addComponents(vcLinkButtonBuilder(interaction));
		if (savedPostData.micRequired == 'Yes')
			buttonRow.addComponents(new ButtonBuilder().setCustomId('MicType').setLabel('Mic Required').setStyle(ButtonStyle.Danger).setDisabled(true));
		if (savedPostData.micRequired == 'No')
			buttonRow.addComponents(new ButtonBuilder().setCustomId('MicType').setLabel('Mic Optional').setStyle(ButtonStyle.Success).setDisabled(true));

		setVCLimit(savedPostData.mode, interaction);

		let playersNeededText = !savedPostData.playersNeeded ? `is looking for a team` : `is looking for ${savedPostData.playersNeeded} more`;

		const savedPostEmbed = new EmbedBuilder()
			.setAuthor({
				name: `${interaction.user.username} ${playersNeededText}`,
				iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
			})
			.setDescription(`<@${interaction.member.id}>'s Message: ${savedPostData.description}`)
			.setThumbnail(`attachment://${savedPostData.mode}.png`)
			.setTimestamp()
			.setFooter({
				text: 'Read channel pins!',
				iconURL: 'attachment://pin.png',
			});

		if (savedPostData.playStyle)
			savedPostEmbed.addFields({
				name: '__Playstyle__',
				value: `${savedPostData.playStyle}`,
				inline: true,
			});

		if (savedPostData.main)
			savedPostEmbed.addFields({
				name: '__Main(s)__',
				value: `${savedPostData.main}`,
				inline: true,
			});

		if (savedPostData.gamerTag)
			savedPostEmbed.addFields({
				name: '__Gamertag__',
				value: `${savedPostData.gamerTag}`,
				inline: true,
			});

		if (buttonRow.components.length == 0) {
			await interaction.channel.send({
				embeds: [savedPostEmbed],
				files: [
					{
						attachment: `${__dirname}/../../images/nonRanked/${savedPostData.mode}.png`,
						name: `${savedPostData.mode}.png`,
					},
					{
						attachment: `${__dirname}/../../images/other/pin.png`,
						name: `pin.png`,
					},
				],
			});
		} else {
			await interaction.channel.send({
				embeds: [savedPostEmbed],
				components: [buttonRow],
				files: [
					{
						attachment: `${__dirname}/../../images/nonRanked/${savedPostData.mode}.png`,
						name: `${savedPostData.mode}.png`,
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