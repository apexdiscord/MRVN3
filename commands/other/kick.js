const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const Database = require('better-sqlite3');
// const db2 = new Database(`${__dirname}/../../databases/memberDecay.sqlite`, { verbose: console.log });
const db2 = new Database(`${__dirname}/../../databases/memberDecay.sqlite`);
const moment = require('moment');
const chalk = require('chalk');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('kick')
		.setDescription('Removes a member from their current voice channel.')
		.addUserOption(option => option.setName('member-name').setDescription('The member to be removed from their voice channel.').setRequired(true)),
	async execute(interaction) {
		await interaction.deferReply({ ephemeral: true });

		const user = interaction.options.getUser('member-name');
		const member = interaction.guild.members.cache.get(user.id);
		const invokerMember = interaction.guild.members.cache.get(interaction.user.id);

		// If the user they mentioned is not in a VC, do nonthing
		if (!member.voice.channel) {
			await interaction.editReply({ content: `<@${user.id}> is not connected to a voice channel.`, ephemeral: true });
			return;
		}

		// If the user they mentioned is in a VC, but the invoker is not in the same VC, do nothing
		if (!invokerMember.voice.channel || invokerMember.voice.channel.id !== member.voice.channel.id) {
			await interaction.editReply({ content: `You must be in the same voice channel as <@${user.id}> to remove them.`, ephemeral: true });
			return;
		}

		// If the user they mentioned is themselves, do nothing
		if (invokerMember.id == user.id) {
			await interaction.editReply({ content: 'You cannot kick yourself from the voice channel.', ephemeral: true });
			return;
		}

		// If the user they mentioned is a moderator, do nothing
		if (member.roles.cache.find(r => r.name === 'Discord Moderator')) {
			// Your code
			await interaction.editReply({ content: 'You cannot kick a moderator from the voice channel.', ephemeral: true });
			return;
		}

		try {
			const userId = user.id;
			const timestamp = moment().unix();

			// Store id and timestamp on kick
			const insertDecayEntry = `INSERT INTO memberDecay1 (id, timestamp) VALUES (?, ?)`;
			db2.prepare(insertDecayEntry).run(userId, timestamp);

			const insertDecayEntry2 = `INSERT INTO memberDecay2 (id, timestamp) VALUES (?, ?)`;
			db2.prepare(insertDecayEntry2).run(userId, timestamp);

			const insertDecayEntry3 = `INSERT INTO memberDecay3 (id, timestamp) VALUES (?, ?)`;
			db2.prepare(insertDecayEntry3).run(userId, timestamp);

			// Fetch the database count of id
			const stmt2 = db2.prepare('SELECT COUNT(*) AS entry_count2 FROM memberDecay1 WHERE id = ?');
			const stmt3 = db2.prepare('SELECT COUNT(*) AS entry_count3 FROM memberDecay2 WHERE id = ?');
			const stmt4 = db2.prepare('SELECT COUNT(*) AS entry_count4 FROM memberDecay3 WHERE id = ?');

			// Execute the query and fetch the result
			const result2 = stmt2.get(userId);
			const result3 = stmt3.get(userId);
			const result4 = stmt4.get(userId);

			// Fetch the entry count
			const entryCount2 = result2.entry_count2;
			const entryCount3 = result3.entry_count3;
			const entryCount4 = result4.entry_count4;

			// Display the entry count
			const response2 = `KICK: 10 Minute Kick Count for ${user.tag} (${userId}): ${entryCount2}`;
			console.log(chalk.bgBlue(response2));

			const response3 = `KICK: 1 Hour Kick Count for ${user.tag} (${userId}): ${entryCount3}`;
			console.log(chalk.bgBlue(response3));

			const response4 = `KICK: 24 Hour Kick Count for ${user.tag} (${userId}): ${entryCount4}`;
			console.log(chalk.bgBlue(response4));

			// Set Timeouts for User
			if (entryCount4 >= 9) {
				member.timeout(2419199_000, 'User was timed out for 28 days due to being kicked from an LFG channel 9 times in the past 24 hours.');
				// 28 days minus one second. For whatever reason, this worked
				// just fine a few days ago with the full 28 days, but now
				// it refuses to work and Discord returns an error. 28 days
				// minus one second seems to work just fine, though.

				// Send Log for 28 Day Timeout
				const unmuteTime = Math.floor(new Date(Date.now() + 2419200000) / 1000);

				const channel = interaction.guild.channels.cache.get(process.env.VC_KICK);
				const timeoutEmbed28 = new EmbedBuilder()
					.setTitle(`${member.user.tag} was issued a 28 day timeout!`)
					.setDescription(`Their timeout will expire <t:${unmuteTime}:R>, <t:${unmuteTime}:d> at <t:${unmuteTime}:t>.`)
					.addFields([
						{
							name: 'User',
							value: `<@${member.user.id}>\n\`${member.user.id}\``,
							inline: true,
						},
						{
							name: 'Kicked By',
							value: `<@${interaction.user.id}>\n\`${interaction.user.id}\``,
							inline: true,
						},
						{
							name: 'Voice Channel',
							value: `<#${member.voice.channelId}>\n\`${member.voice.channelId}\``,
							inline: true,
						},
						{
							name: '10m Kick Count',
							value: `${entryCount2}`,
							inline: true,
						},
						{
							name: '1h Kick Count',
							value: `${entryCount3}`,
							inline: true,
						},
						{
							name: '28d Kick Count',
							value: `${entryCount4}`,
							inline: true,
						},
					])
					.setTimestamp()
					.setColor('CA2128');

				channel.send({ embeds: [timeoutEmbed28] });
			} else if (entryCount3 >= 6) {
				member.timeout(3600_000, 'User was timed out for 1 hour due to being kicked from an LFG channel 6 or more times in the past 24 hours.');

				const unmuteTime = Math.floor(new Date(Date.now() + 60 * 60 * 1000) / 1000);

				// Send Log for 60 Minute Timeout
				const channel = interaction.guild.channels.cache.get(process.env.VC_KICK);
				const timeoutEmbed60 = new EmbedBuilder()
					.setTitle(`${member.user.tag} was issued a 60 minute timeout!`)
					.setDescription(`Their timeout will expire <t:${unmuteTime}:R>, at <t:${unmuteTime}:t>.`)
					.addFields([
						{
							name: 'User',
							value: `<@${member.user.id}>\n\`${member.user.id}\``,
							inline: true,
						},
						{
							name: 'Kicked By',
							value: `<@${interaction.user.id}>\n\`${interaction.user.id}\``,
							inline: true,
						},
						{
							name: 'Voice Channel',
							value: `<#${member.voice.channelId}>\n\`${member.voice.channelId}\``,
							inline: true,
						},
						{
							name: '10m Kick Count',
							value: `${entryCount2}`,
							inline: true,
						},
						{
							name: '1h Kick Count',
							value: `${entryCount3}`,
							inline: true,
						},
						{
							name: '28d Kick Count',
							value: `${entryCount4}`,
							inline: true,
						},
					])
					.setTimestamp()
					.setColor('E9BE1A');

				channel.send({ embeds: [timeoutEmbed60] });
			} else if (entryCount2 >= 3) {
				member.timeout(600_000, 'User was timed out for 10 minutes due to being kicked from an LFG channel 3 or more times in the past hour.');

				const unmuteTime = Math.floor(new Date(Date.now() + 10 * 60 * 1000) / 1000);

				// Send Log for 10 Minute Timeout
				const channel = interaction.guild.channels.cache.get(process.env.VC_KICK);
				const timeoutEmbed10 = new EmbedBuilder()
					.setTitle(`${member.user.tag} was issued a 10 minute timeout!`)
					.setDescription(`Their timeout will expire <t:${unmuteTime}:R>, at <t:${unmuteTime}:t>.`)
					.addFields([
						{
							name: 'User',
							value: `<@${member.user.id}>\n\`${member.user.id}\``,
							inline: true,
						},
						{
							name: 'Kicked By',
							value: `<@${interaction.user.id}>\n\`${interaction.user.id}\``,
							inline: true,
						},
						{
							name: 'Voice Channel',
							value: `<#${member.voice.channelId}>\n\`${member.voice.channelId}\``,
							inline: true,
						},
						{
							name: '10m Kick Count',
							value: `${entryCount2}`,
							inline: true,
						},
						{
							name: '1h Kick Count',
							value: `${entryCount3}`,
							inline: true,
						},
						{
							name: '28d Kick Count',
							value: `${entryCount4}`,
							inline: true,
						},
					])
					.setTimestamp()
					.setColor('1A6EC8');

				channel.send({ embeds: [timeoutEmbed10] });
			} else {
				// Send Log for Kick
				const channel = interaction.guild.channels.cache.get(process.env.VC_KICK);
				const timeoutEmbed10 = new EmbedBuilder()
					.setTitle(`${member.user.tag} was kicked from a VC!`)
					.setDescription('They were kicked from a VC, but were not issued a timeout.')
					.addFields([
						{
							name: 'User',
							value: `<@${member.user.id}>\n\`${member.user.id}\``,
							inline: true,
						},
						{
							name: 'Kicked By',
							value: `<@${interaction.user.id}>\n\`${interaction.user.id}\``,
							inline: true,
						},
						{
							name: 'Voice Channel',
							value: `<#${member.voice.channelId}>\n\`${member.voice.channelId}\``,
							inline: true,
						},
						{
							name: '10m Kick Count',
							value: `${entryCount2}`,
							inline: true,
						},
						{
							name: '1h Kick Count',
							value: `${entryCount3}`,
							inline: true,
						},
						{
							name: '28d Kick Count',
							value: `${entryCount4}`,
							inline: true,
						},
					])
					.setTimestamp()
					.setColor('1A6EC8');

				channel.send({ embeds: [timeoutEmbed10] });
			}

			// Move disconnect to under logging to allow the ID to pass to the log embeds
			await member.voice.disconnect();
			await interaction.editReply({
				content: `Successfully removed <@${user.id}> from the voice channel.\nPlease report any repeated rule breaking behaviour to <@542736472155881473> with the ID of the user you kicked.`,
				ephemeral: true,
			});
		} catch (error) {
			console.error(error);
			await interaction.editReply({ content: 'There was an error while executing this command!', ephemeral: true });
		}
	},
};
