const axios = require('axios');
const db = require('../../utilities/database.js');
const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('link')
		.setDescription('Link an existing Apex account to your Discord account.')
		.addStringOption(option =>
			option.setName('platform').setDescription('The platform you play on').setRequired(true).addChoices(
				{
					name: 'PC (Steam/Origin)',
					value: 'PC',
				},
				{
					name: 'PlayStation',
					value: 'PS4',
				},
				{
					name: 'Xbox',
					value: 'X1',
				},
			),
		)
		.addStringOption(option => option.setName('username').setDescription("Your in-game username. If this doesn't work, try a previous username").setRequired(true)),

	async execute(interaction) {
		const platform = interaction.options.getString('platform');
		const username = interaction.options.getString('username');

		const loadingEmbed = new EmbedBuilder().setDescription(`Loading data for selected account...`);
		await interaction.reply({ embeds: [loadingEmbed] });

		try {
			const response = await axios.get(`https://api.jumpmaster.xyz/user/Stats?platform=${platform}&player=${encodeURIComponent(username)}&key=${process.env.SPYGLASS}`);
			const data = response.data;
		
			const playerID = data.user.id;
			const discordID = interaction.user.id;
		
			const linkQuery = 'SELECT * FROM temp_linking WHERE discordID = ?';
			db.query(linkQuery, [discordID], async (err, row) => {
				if (err) {
					console.log(err);
					return interaction.editReply({ content: 'There was a database error.', embeds: [] });
				}
		
				if (row.length === 0) {
					const insertTempLink = `INSERT INTO temp_linking (discordID, playerID, platform, expiry) VALUES (?, ?, ?, DATE_ADD(NOW(), INTERVAL 15 MINUTE))`;
					db.query(insertTempLink, [discordID, playerID, platform], async (err, row) => {
						if (err) return console.log(err);
		
						const allTrackersQuery = 'SELECT * FROM game_trackers ORDER BY RAND() LIMIT 3';
						db.query(allTrackersQuery, async (err, randomTrackers) => {
							if (err) {
								console.log(err);
								return interaction.editReply({ content: 'There was a database error while fetching trackers.', embeds: [] });
							}
		
							const initialTrackerIDs = data.active.trackers.map(tracker => tracker.id);
		
							await interaction.editReply({
								content: `Linked player \`${data.user.username}\` to discord account \`${interaction.user.tag}\`. Use \`/me\` to view your linked account.\n\nEquip the following trackers in-game within the next 15 minutes:\n1. **${randomTrackers[0].trackerName}** (Tracker ID: ${randomTrackers[0].trackerID})\n2. **${randomTrackers[1].trackerName}** (Tracker ID: ${randomTrackers[1].trackerID})\n3. **${randomTrackers[2].trackerName}** (Tracker ID: ${randomTrackers[2].trackerID})`,
								embeds: [],
							});
		
							setTimeout(async () => {
								const linkDataQuery = 'SELECT * FROM temp_linking WHERE discordID = ?';
								db.query(linkDataQuery, [discordID], async (err, tempLinkData) => {
									if (err) {
										console.log(err);
										return;
									}
		
									if (tempLinkData.length === 0) {
										// Temp link data expired or doesn't exist
										console.log('Temp link data not found.');
										return;
									}
		
									const expiry = tempLinkData[0].expiry;
									const currentTime = new Date();
		
									if (currentTime > expiry) {
										// 15-minute window expired
										console.log('15-minute window expired.');
										return;
									}
		
									const updatedData = await axios.get(`https://api.jumpmaster.xyz/user/Stats?platform=${platform}&player=${encodeURIComponent(username)}&key=${process.env.SPYGLASS}`);
									const equippedTrackerIDs = updatedData.data.active.trackers.map(tracker => tracker.id);
		
									const matchingTrackers = randomTrackers.every(randomTracker => {
										return equippedTrackerIDs.includes(randomTracker.trackerID);
									});
		
									if (matchingTrackers) {
										const userLinkQuery = 'INSERT INTO specter (discordID, playerID, platform) VALUES (?, ?, ?)';
										db.query(userLinkQuery, [discordID, playerID, platform], (err, row) => {
											if (err) return console.log(err);
										});
									} else {
										console.log('Tracker matching failed after 15 minutes.');
										interaction.channel.send('The link was not successful. Please equip the provided trackers within the next 15 minutes.');
									}
								});
							}, 900000); // 15 minutes in ms
						});
					});
                } else {
                    return interaction.editReply({
                        content: 'You already have a linked account. Use `/me` to see your linked account or `/unlink` to unlink your account.',
                        embeds: [],
                    });
                }
            });
		} catch (error) {
			if (error.response) {
				console.log(error.response.data);

				const errorEmbed = new EmbedBuilder()
					.setTitle('Player Lookup Error')
					.setDescription(`There was an error finding your account, linking to your discord account has been canceled.\n\n${error.response.data.error}`)
					.setColor('D0342C')
					.setTimestamp();

				interaction.editReply({ embeds: [errorEmbed] });
			} else if (error.request) {
				console.log(error.request);

				const errorEmbed = new EmbedBuilder()
					.setTitle('Site Lookup Error')
					.setDescription(
						`There was an error finding your account, linking to your discord account has been canceled.\n\nThe request was not returned successfully.\nThis is potentially an error with the API.\nPlease try again shortly.`,
					)
					.setColor('D0342C')
					.setTimestamp();

				interaction.editReply({ embeds: [errorEmbed] });
			} else {
				console.log(error.message);

				const errorEmbed = new EmbedBuilder()
					.setTitle('Unknown Error')
					.setDescription(`This should never happen.\nIf you see this error, please contact <@360564818123554836> ASAP.`)
					.setColor('D0342C');

				interaction.editReply({ embeds: [errorEmbed] });
			}
		}
	},
};
