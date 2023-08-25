const axios = require('axios');
const db = require('../../functions/database.js');
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
		const expiryTime = currentTime + 900;

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

			const legends = ['Bloodhound', 'Gibraltar', 'Lifeline', 'Pathfinder', 'Wraith', 'Bangalore'];
			const randomLegend = Math.floor(Math.random() * legends.length);
			const trackers = require(`../../data/legendTrackers/${legends[randomLegend]}.json`);
			const trackerData = require(`../../data/legendTrackers/${legends[randomLegend]}_Reference.json`);

			console.log(randomLegend, legends[randomLegend]);

			var chooser = randomNoRepeats(trackerData);

			const insertTempLink = `INSERT INTO temp_linking (discordID, playerID, platform, legend, trackerOneID, trackerTwoID, trackerThreeID, expiry) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

			db.query(insertTempLink, [discordID, playerID, platform, legends[randomLegend], chooser(), chooser(), chooser(), expiryTime], async (err, row) => {
				if (err) return console.log(err);

				console.log('inserted user and tracker data into temp_linking');
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
