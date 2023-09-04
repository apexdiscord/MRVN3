const axios = require('axios');
const Database = require('../../functions/database.js');
const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('link')
		.setDescription('Link an existing Apex account to your Discord account.')
		.addStringOption(option =>
			option.setName('platform').setDescription('The platform of the account you want to link.').setRequired(true).addChoices(
				{
					name: 'PC (Steam/EA App)',
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
		.addStringOption(option => option.setName('username').setDescription("Your in-game username. If this doesn't work, try a previous username.").setRequired(true)),

	async execute(interaction) {
		await interaction.deferReply({ ephemeral: true });

		const platform = interaction.options.getString('platform');
		const username = interaction.options.getString('username');

		const currentTime = Math.round(new Date().getTime() / 1000);

		function randomNoRepeats(array) {
			var copy = array.slice(0);
			return function () {
				if (copy.length < 1) {
					copy = array.slice(0);
				}
				var index = Math.floor(Math.random() * copy.length);
				var item = copy[index];
				copy.splice(index, 1);
				return item;
			};
		}

		try {
			const response = await axios.get(`https://api.jumpmaster.xyz/user/MRVN_Link?platform=${platform}&player=${encodeURIComponent(username)}&key=${process.env.SPYGLASS}`);
			const data = response.data;

			const playerID = data.user.id;
			const discordID = interaction.user.id;

			Database.query('SELECT COUNT(*) AS count FROM temp_linking WHERE discordID = ?', [discordID], async (err, row) => {
				if (err) console.log(err);

				if (row[0]['count'] >= 1) {
					console.log('cannot continue, temp link already exists');

					const getTrackers = 'SELECT legend, trackerOneID, trackerTwoID, trackerThreeID, expiry FROM temp_linking WHERE discordID = ?';

					Database.query(getTrackers, [discordID], async (err, row) => {
						if (err) console.log(err);

						const legends = ['Bloodhound', 'Gibraltar', 'Lifeline', 'Pathfinder', 'Wraith', 'Bangalore'];
						const trackers = require(`../../data/legendTrackers/${row[0]['legend']}.json`);

						const legend = row[0]['legend'];
						const trackerOneID = row[0]['trackerOneID'];
						const trackerTwoID = row[0]['trackerTwoID'];
						const trackerThreeID = row[0]['trackerThreeID'];

						interaction.editReply(
							`you already have an account link in progress. pls add the following trackers to your banner as ${legend} in the following order:\n1. ${
								trackers[trackerOneID].Name
							}\n2. ${trackers[trackerTwoID].Name}\n3. ${
								trackers[trackerThreeID].Name
							}\nthen run the \`/verify\` command to verify your account\n\nif u dont want this account linked, please wait for the link to expire <t:${
								parseInt(row[0]['expiry']) + 900
							}:R>`,
						);
					});

					return;
				}

				Database.query('SELECT COUNT(*) AS count FROM specter WHERE discordID = ?', [discordID], async (err, row) => {
					if (err) console.log(err);

					if (row[0]['count'] >= 1) {
						console.log('cannot continue, temp link already exists');

						interaction.editReply(
							'u cannot continue as u already have an account linked. your stats will automatically show up in lfg posts. u can type `/unlink` to unlink ur account.',
						);

						return;
					}

					const legends = ['Bloodhound', 'Gibraltar', 'Lifeline', 'Pathfinder', 'Wraith', 'Bangalore'];
					const randomLegend = Math.floor(Math.random() * legends.length);
					const trackers = require(`../../data/legendTrackers/${legends[randomLegend]}.json`);
					const trackerData = require(`../../data/legendTrackers/${legends[randomLegend]}_Reference.json`);

					console.log(randomLegend, legends[randomLegend]);

					var chooser = randomNoRepeats(trackerData);

					const insertTempLink = `INSERT INTO temp_linking (discordID, playerID, platform, legend, trackerOneID, trackerTwoID, trackerThreeID, expiry) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

					Database.query(insertTempLink, [discordID, playerID, platform, legends[randomLegend], chooser(), chooser(), chooser(), currentTime], async (err, row) => {
						if (err) return console.log(err);

						console.log('inserted user and tracker data into temp_linking');

						const getTrackers = 'SELECT legend, trackerOneID, trackerTwoID, trackerThreeID FROM temp_linking WHERE discordID = ?';

						Database.query(getTrackers, [discordID], async (err, row) => {
							if (err) console.log(err);

							const legend = row[0]['legend'];
							const trackerOneID = row[0]['trackerOneID'];
							const trackerTwoID = row[0]['trackerTwoID'];
							const trackerThreeID = row[0]['trackerThreeID'];

							interaction.editReply(
								`hey! pls add the following trackers to your banner as ${legend} in the following order:\n1. ${trackers[trackerOneID].Name}\n2. ${trackers[trackerTwoID].Name}\n3. ${trackers[trackerThreeID].Name}\nthen run the \`/verify\` command to verify your account`,
							);
						});
					});
				});
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
