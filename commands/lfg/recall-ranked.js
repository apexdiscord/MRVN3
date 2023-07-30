const moment = require('moment');
const db = require('../../functions/database.js');
const Database = require('better-sqlite3');
const { ButtonStyle, EmbedBuilder, ButtonBuilder, ActionRowBuilder, SlashCommandBuilder } = require('discord.js');

const { setVCLimit, checkVoiceChannel, vcLinkButtonBuilder, doesUserHaveSlowmode } = require('../../functions/utilities.js');
const db_savedLFGPosts = new Database(`${__dirname}/../../databases/savedLFGPosts.sqlite`);

module.exports = {
	data: new SlashCommandBuilder().setName('rr').setDescription('Recall your saved ranked LFG post. These posts are deleted after they have been saved for 7 days.'),

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
		const savedPostData = db_savedLFGPosts.prepare(`SELECT * FROM rankedLFG WHERE user_id = ?`).get(interaction.user.id);

		// If there is no saved post, return an error
		if (!savedPostData) {
			await interaction.editReply({
				content: 'You have not saved an LFG post. Use an LFG command and select `Yes` for the "save" option to save a post!',
				ephemeral: true,
			});

			return;
		}

		// Check for a slowmode in the channel the interaction is created in.
		// If there is, set that to the slowmode for the LFG post minute 30 seconds
		// so that it is quicker to post an LFG post than to send a channel, but still
		// have a slowmode to prevent people from spamming it
		var slowmodeAmount = interaction.channel.rateLimitPerUser === 0 ? 90 : interaction.channel.rateLimitPerUser - 30;

		// Check if the user has a slowmode. If true, return and don't execute
		// If false, continue with the command and add a slowmode to the user
		await doesUserHaveSlowmode(interaction, slowmodeAmount);

		let slowmodeQuery = 'SELECT postTimestamp FROM userSlowmodeTheSecond WHERE discordID = ?';

		db.query(slowmodeQuery, [interaction.user.id], async (err, slowmodeRow) => {
			if (slowmodeRow.length != 0) {
				if (slowmodeRow[0].postTimestamp + slowmodeAmount > moment().unix()) {
					return;
				}
			}

			await interaction.editReply({
				content: 'Posted your saved LFG post below.',
				ephemeral: true,
			});

			const currentRankText = function () {
				if (savedPostData.currentRank == 'Predator') return 'Apex Predator';

				return savedPostData.currentRank;
			};

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
				.setThumbnail(`attachment://Ranked_${savedPostData.currentRank}.png`)
				.setTimestamp()
				.setFooter({
					text: 'Read channel pins!',
					iconURL: 'attachment://pin.png',
				});

			if (savedPostData.currentRank)
				savedPostEmbed.addFields({
					name: '__Current Rank__',
					value: `${currentRankText()}`,
					inline: true,
				});

			if (savedPostData.previousRank)
				savedPostEmbed.addFields({
					name: '__Previous Rank__',
					value: `${savedPostData.previousRank}`,
					inline: true,
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
							attachment: `${__dirname}/../../images/ranked/Ranked_${savedPostData.currentRank}.png`,
							name: `Ranked_${savedPostData.currentRank}.png`,
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
							attachment: `${__dirname}/../../images/ranked/Ranked_${savedPostData.currentRank}.png`,
							name: `Ranked_${savedPostData.currentRank}.png`,
						},
						{
							attachment: `${__dirname}/../../images/other/pin.png`,
							name: `pin.png`,
						},
					],
				});
			}
		});
	},
};
