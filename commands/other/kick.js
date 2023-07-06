const moment = require('moment');
const Database = require('better-sqlite3');
const { SlashCommandBuilder } = require('discord.js');
const { Table } = require('console-table-printer');

const { timeoutController } = require('../../functions/utilities.js');
const db_memberDecay = new Database(`${__dirname}/../../databases/memberDecay.sqlite`);

module.exports = {
	data: new SlashCommandBuilder()
		.setName('kick')
		.setDescription('Removes a user from your channel. You must have joined an empty channel first to use this command.')
		.addUserOption(option => option.setName('member-name').setDescription('The username of the user you want to kick.').setRequired(true)),

	async execute(interaction) {
		await interaction.deferReply({ ephemeral: true });

		// User to kick
		const userToKick = interaction.options.getUser('member-name');
		const memberToKick = interaction.guild.members.cache.get(userToKick.id);

		// User who used the command
		const kickUser = interaction.guild.members.cache.get(interaction.user.id);

		// If the person the user mentioned is themselves, do nothing
		if (kickUser.id == userToKick.id) return await interaction.editReply({ content: `You cannot kick yourself from the voice channel.`, ephemeral: true });

		// If the person the user wants to kick is not in a voice channel, display an error
		if (!memberToKick.voice.channel) return await interaction.editReply({ content: `<@${memberToKick.id}> is not connected to a voice channel.`, ephemeral: true });

		// If the person the user mentioned is in a voice channel but
		// not the one the user is in, display an error
		if (!memberToKick.voice.channel || memberToKick.voice.channel.id !== kickUser.voice.channel.id)
			return await interaction.editReply({ content: `You must be in the same voice channel as <@${memberToKick.id}> to kick them.`, ephemeral: true });

		// If the person the user mentioned is server staff, do nothing
		if (memberToKick.roles.cache.some(role => role.name === 'Discord Moderator'))
			return await interaction.editReply({ content: `You cannot kick <@${memberToKick.id}> as they are server staff.`, ephemeral: true });

		try {
			const timestamp = moment().unix();
			const userToKickID = userToKick.id;

			// Store the kicked users ID and Timestamp on kick
			db_memberDecay.prepare(`INSERT INTO memberDecay1 (id, timestamp) VALUES (?, ?)`).run(userToKickID, timestamp);
			db_memberDecay.prepare(`INSERT INTO memberDecay2 (id, timestamp) VALUES (?, ?)`).run(userToKickID, timestamp);
			db_memberDecay.prepare(`INSERT INTO memberDecay3 (id, timestamp) VALUES (?, ?)`).run(userToKickID, timestamp);

			// Fetch the amount of times they are counted in the database
			const entryCount1 = db_memberDecay.prepare(`SELECT COUNT(*) AS countOne FROM memberDecay1 WHERE id = ?`).get(userToKickID);
			const entryCount2 = db_memberDecay.prepare(`SELECT COUNT(*) AS countTwo FROM memberDecay2 WHERE id = ?`).get(userToKickID);
			const entryCount3 = db_memberDecay.prepare(`SELECT COUNT(*) AS countThree FROM memberDecay3 WHERE id = ?`).get(userToKickID);

			const entryCountTable = new Table({
				title: `Kick Count for ${memberToKick.user.tag} (${memberToKick.user.id})`,
				columns: [
					{ name: 'entryCount1', title: '10m Timeout Count', color: 'blue' },
					{ name: 'entryCount2', title: '1h Timeout Count', color: 'yellow' },
					{ name: 'entryCount3', title: '28d Timeout Count', color: 'red' },
				],
			});

			entryCountTable.addRows([
				{
					entryCount1: entryCount1.countOne,
					entryCount2: entryCount2.countTwo,
					entryCount3: entryCount3.countThree,
				},
			]);

			entryCountTable.printTable();

			// Set timeouts for kicked user
			if (entryCount3.countThree >= 9) {
				timeoutController(2419199_000, 2419199000, memberToKick, interaction, entryCount1.countOne, entryCount2.countTwo, entryCount3.countThree);
			} else if (entryCount2.countTwo >= 6) {
				timeoutController(3600_000, 3600000, memberToKick, interaction, entryCount1.countOne, entryCount2.countTwo, entryCount3.countThree);
			} else if (entryCount1.countOne >= 3) {
				timeoutController(600_000, 600000, memberToKick, interaction, entryCount1.countOne, entryCount2.countTwo, entryCount3.countThree);
			} else {
				timeoutController(0, 0, memberToKick, interaction, entryCount1.countOne, entryCount2.countTwo, entryCount3.countThree);
			}

			// If the kick count is less than 2, don't show the "Message ModMail" portion of the kick message
			var kickModMailText =
				entryCount2.countTwo <= 2 ? '' : '\nPlease report any repeated rule breaking behaviour to <@542736472155881473> with the ID of the user you kicked.';

			await interaction.editReply({
				content: `Successfully removed <@${userToKick.id}> from the voice channel.${kickModMailText}`,
				ephemeral: true,
			});
		} catch (error) {
			console.log(error);

			await interaction.editReply({ content: 'There was an error while executing this command!', ephemeral: true });
		}
	},
};
