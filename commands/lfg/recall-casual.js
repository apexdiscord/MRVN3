const moment = require('moment');
const { Axiom } = require('@axiomhq/js');
const db = require('../../functions/database.js');
const { ButtonStyle, ButtonBuilder, ActionRowBuilder, SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');

const { setVCLimit, splitChannelName, checkVoiceChannel, vcLinkButtonBuilder, doesUserHaveSlowmode } = require('../../functions/utilities.js');

const axiomIngest = new Axiom({
	token: process.env.AXIOM_TOKEN,
	orgId: process.env.AXIOM_ORG,
});

module.exports = {
	data: new SlashCommandBuilder().setName('rc').setDescription('Recall your saved casual LFG post. These posts are deleted after they have been saved for 28 days.'),

	async execute(interaction) {
		await interaction.deferReply({ flags: MessageFlags.Ephemeral });

		// Check to see if they are in a VC that in a category
		// that is not allowed to be edited.
		if (checkVoiceChannel(interaction.member.voice) == true) {
			await interaction.editReply({
				content: `You cannot use this command while in <#${interaction.member.voice.channel.id}>.\nPlease disconnect or move to an LFG voice channel.`,
				flags: MessageFlags.Ephemeral,
			});

			return;
		}

		// Retrieve the saved LFG data from the database
		const savedPostData = `SELECT * FROM savedCasualLFGPosts WHERE discordID = ? ORDER BY timestamp DESC LIMIT 1`;

		db.query(savedPostData, [interaction.user.id], async (err, savedDataRow) => {
			// If there is no saved post, return an error
			if (savedDataRow.length === 0) {
				await interaction.editReply({
					content: 'You have not saved an LFG post. Use an LFG command and select `Yes` for the "save" option to save a post!',
					flags: MessageFlags.Ephemeral,
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

			let slowmodeQuery = 'SELECT postTimestamp FROM userPostSlowmode WHERE discordID = ?';

			db.query(slowmodeQuery, [interaction.user.id], async (err, slowmodeRow) => {
				if (slowmodeRow.length != 0) {
					if (slowmodeRow[0].postTimestamp + slowmodeAmount > moment().unix()) {
						return;
					}
				}

				await interaction.editReply({
					content: 'Posted your saved LFG post below.',
					flags: MessageFlags.Ephemeral,
				});

				const buttonRow = new ActionRowBuilder();

				if (vcLinkButtonBuilder(interaction) != null) buttonRow.addComponents(vcLinkButtonBuilder(interaction));
				if (savedDataRow[0].micRequired == 'Yes')
					buttonRow.addComponents(new ButtonBuilder().setCustomId('MicType').setLabel('Mic Required').setStyle(ButtonStyle.Danger).setDisabled(true));
				if (savedDataRow[0].micRequired == 'No')
					buttonRow.addComponents(new ButtonBuilder().setCustomId('MicType').setLabel('Mic Optional').setStyle(ButtonStyle.Success).setDisabled(true));
				var vcLink = vcLinkButtonBuilder(interaction) != null ? `\n\nVoice Channel: <#${interaction.member.voice.channel.id}>` : '';

				setVCLimit(savedDataRow[0].mode, interaction);

				let playersNeededText = !savedDataRow[0].playersNeeded ? `is looking for a team` : `is looking for ${savedDataRow[0].playersNeeded} more`;

				const savedPostEmbed = new EmbedBuilder()
					.setAuthor({
						name: `${interaction.user.username} ${playersNeededText}`,
						iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
					})
					.setDescription(`<@${interaction.member.id}>'s Message: ${savedDataRow[0].message} ${vcLink}`)
					.setThumbnail(`attachment://${savedDataRow[0].mode}.png`)
					.setTimestamp()
					.setFooter({
						text: 'Read channel pins!',
						iconURL: 'attachment://pin.png',
					});

				if (savedDataRow[0].playStyle)
					savedPostEmbed.addFields({
						name: '__Playstyle__',
						value: `${savedDataRow[0].playStyle}`,
						inline: true,
					});

				if (savedDataRow[0].mainLegend)
					savedPostEmbed.addFields({
						name: '__Main(s)__',
						value: `${savedDataRow[0].mainLegend}`,
						inline: true,
					});

				if (savedDataRow[0].gamertag)
					savedPostEmbed.addFields({
						name: '__Gamertag__',
						value: `${savedDataRow[0].gamertag}`,
						inline: true,
					});

				axiomIngest.ingest('mrvn.lfg', [{ region: splitChannelName(interaction.channel.name, 0), platform: splitChannelName(interaction.channel.name, 1) }]);

				if (buttonRow.components.length == 0) {
					await interaction.channel.send({
						embeds: [savedPostEmbed],
						files: [
							{
								attachment: `${__dirname}/../../images/nonRanked/${savedDataRow[0].mode}.png`,
								name: `${savedDataRow[0].mode}.png`,
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
								attachment: `${__dirname}/../../images/nonRanked/${savedDataRow[0].mode}.png`,
								name: `${savedDataRow[0].mode}.png`,
							},
							{
								attachment: `${__dirname}/../../images/other/pin.png`,
								name: `pin.png`,
							},
						],
					});
				}
			});
		});
	},
};
