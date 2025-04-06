const chalk = require('chalk');
const moment = require('moment');
const Database = require('better-sqlite3');
const { SlashCommandBuilder, MessageFlags } = require('discord.js');

const { timeoutController } = require('../../functions/utilities.js');
const db_memberDecay = new Database(`${__dirname}/../../databases/memberDecay.sqlite`);

module.exports = {
	data: new SlashCommandBuilder()
		.setName('kick')
		.setDescription('Removes a user from your channel. You must have joined an empty channel first to use this command.')
		.addUserOption(option => option.setName('member-name').setDescription('The username of the user you want to kick.').setRequired(true))
		.addStringOption(option => option.setName('reason').setDescription('The reason for kicking the user.').setRequired(true)),

	async execute(interaction) {
		await interaction.deferReply({ flags: MessageFlags.Ephemeral });

		// Get reason for kick
		const kickReason = interaction.options.getString('reason') || null;

		// User to kick
		const userToKick = interaction.options.getUser('member-name');
		const memberToKick = interaction.guild.members.cache.get(userToKick.id);

		// User who used the command
		const kickUser = interaction.guild.members.cache.get(interaction.user.id);

		// If the person the user mentioned is themselves, do nothing
		if (kickUser.id == userToKick.id) return await interaction.editReply({ content: `You cannot kick yourself from the voice channel.`, flags: MessageFlags.Ephemeral });

		// If the person the user wants to kick is not in a voice channel, display an error
		if (!memberToKick.voice.channel)
			return await interaction.editReply({ content: `<@${memberToKick.id}> is not connected to a voice channel.`, flags: MessageFlags.Ephemeral });

		// If the person the user mentioned is in a voice channel but
		// not the one the user is in, display an error
		if (!memberToKick.voice.channel || memberToKick.voice.channel.id !== kickUser.voice.channel.id)
			return await interaction.editReply({ content: `You must be in the same voice channel as <@${memberToKick.id}> to kick them.`, flags: MessageFlags.Ephemeral });

		// If the person the user mentioned is server staff, do nothing
		if (memberToKick.roles.cache.some(role => role.name === 'Staff'))
			return await interaction.editReply({ content: `You cannot kick <@${memberToKick.id}> as they are server staff.`, flags: MessageFlags.Ephemeral });

		try {
			const timestamp = moment().unix();
			const userToKickID = userToKick.id;

			// Store the kicked users ID and Timestamp on kick
			db_memberDecay.prepare(`INSERT INTO memberDecay1 (id, timestamp) VALUES (?, ?)`).run(userToKickID, timestamp);
			db_memberDecay.prepare(`INSERT INTO memberDecay2 (id, timestamp) VALUES (?, ?)`).run(userToKickID, timestamp);
			db_memberDecay.prepare(`INSERT INTO memberDecay3 (id, timestamp) VALUES (?, ?)`).run(userToKickID, timestamp);

			// Fetch the amount of times they are counted in the database
			const entryCount1 = db_memberDecay.prepare(`SELECT COUNT(*) FROM memberDecay1 WHERE id = ?`).get(userToKickID)['COUNT(*)'];
			const entryCount2 = db_memberDecay.prepare(`SELECT COUNT(*) FROM memberDecay2 WHERE id = ?`).get(userToKickID)['COUNT(*)'];
			const entryCount3 = db_memberDecay.prepare(`SELECT COUNT(*) FROM memberDecay3 WHERE id = ?`).get(userToKickID)['COUNT(*)'];

			// Set timeouts for kicked user
			if (entryCount3 >= 9) {
				timeoutController(2419199_000, 2419199000, memberToKick, interaction, entryCount1, entryCount2, entryCount3, kickReason);
			} else if (entryCount2 >= 6) {
				timeoutController(3600_000, 3600000, memberToKick, interaction, entryCount1, entryCount2, entryCount3, kickReason);
			} else if (entryCount1 >= 3) {
				timeoutController(600_000, 600000, memberToKick, interaction, entryCount1, entryCount2, entryCount3, kickReason);
			} else {
				timeoutController(0, 0, memberToKick, interaction, entryCount1, entryCount2, entryCount3, kickReason);
			}

			// If the kick count is less than 2, don't show the "Message ModMail" portion of the kick message
			var kickModMailText = entryCount2 <= 2 ? '' : '\nPlease report any repeated rule breaking behaviour to <@542736472155881473> with the ID of the user you kicked.';

			await interaction.editReply({
				content: `Successfully removed <@${userToKick.id}> from the voice channel.${kickModMailText}`,
				flags: MessageFlags.Ephemeral,
			});

			// Send a DM to the user when they are kicked
			userToKick
				.send(
					'You were kicked from a voice channel by another user. Repeated kicks may lead to a timeout.\n\n*The user who kicked you is not a mod. Please refer to https://discord.com/channels/541484311354933258/542256155125219339/1118325007999827968 for information.*',
				)
				.catch(error => {
					console.log(chalk.yellow(`${chalk.bold(`BOT:`)} Could not DM user.`));
				});
		} catch (error) {
			console.log(error);

			await interaction.editReply({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
		}
	},
};
