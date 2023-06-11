const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const Database = require('better-sqlite3');
// const db2 = new Database(`${__dirname}/../../databases/memberDecay.sqlite`, { verbose: console.log });
const db2 = new Database(`${__dirname}/../../databases/memberDecay.sqlite`);
const moment = require('moment');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('kick')
		.setDescription('Removes a member from their current voice channel.')
		.addUserOption(option => option.setName('member-name').setDescription('The member to be removed from their voice channel.').setRequired(true)),
	async execute(interaction) {
		const user = interaction.options.getUser('member-name');
		const member = interaction.guild.members.cache.get(user.id);
		const invokerMember = interaction.guild.members.cache.get(interaction.user.id);
		if (!member.voice.channel) {
			await interaction.reply({ content: 'This member is not connected to a voice channel.', ephemeral: true });
			return;
		}
		if (!invokerMember.voice.channel || invokerMember.voice.channel.id !== member.voice.channel.id) {
			await interaction.reply({ content: 'You must be in the same voice channel as the member you want to remove.', ephemeral: true });
			return;
		}
		if (invokerMember.id == user.id) {
			await interaction.reply({ content: 'You cannot kick yourself from the voice channel.', ephemeral: true });
			return;
		}
		try {
			await member.voice.disconnect();
			await interaction.reply({ content: `Successfully removed ${user.username} from their voice channel.`, ephemeral: true });

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
			const response2 = `10 Minute Kick Count for ${user.tag} (${userId}): ${entryCount2}`;
			console.log(response2);

			const response3 = `1 Hour Kick Count for ${user.tag} (${userId}): ${entryCount3}`;
			console.log(response3);

			const response4 = `24 Hour Kick Count for ${user.tag} (${userId}): ${entryCount4}`;
			console.log(response4);

			// Timeouts
			// if (entryCount2 >= 2) {
			// 	member.timeout(600_000);
			// }
			// if (entryCount3 >= 6) {
			// 	member.timeout(3600_000);
			// }
			// if (entryCount4 >= 9) {
			// 	member.timeout(2419200_000);

			// 	const channel = interaction.guild.channels.cache.get(process.env.VC_KICK);
			// 	channel.send(
			// 		`The kick counts for <@${member.user.id}> are now:\n${entryCount2} time(s) in the past 10m\n${entryCount3} time(s) in the past 1h\n${entryCount4} time(s) in the past 24h`,
			// 	);
			// }

			// Set Timeouts for User
			if (entryCount4 >= 9) {
				// member.timeout(2419199_000); Temporarily disable, set to 60 seconds for testing
				member.timeout(60_000);

				// Send Log for 28 Day Timeout
				const unmuteTime = Math.floor(new Date(Date.now() + 2419200000) / 1000);

				const channel = interaction.guild.channels.cache.get(process.env.VC_KICK);
				const timeoutEmbed28 = new EmbedBuilder()
					.setTitle(`${member.user.username} was issued a 28 day timeout!`)
					.addFields([
						{
							name: 'User',
							value: `<@${member.user.id}>\n\`${member.user.id}\``,
							inline: true,
						},
						{
							name: 'Expires',
							value: `<t:${unmuteTime}:f>\n<t:${unmuteTime}:R>`,
							inline: true,
						},
					])
					.setColor('CA2128');

				channel.send({ embeds: [timeoutEmbed28] });
			} else if (entryCount3 >= 6) {
				// member.timeout(3600_000); Temporarily disable, set to 60 seconds for testing
				member.timeout(60_000);

				const unmuteTime = Math.floor(new Date(Date.now() + 60 * 60 * 1000) / 1000);

				// Send Log for 60 Minute Timeout
				const channel = interaction.guild.channels.cache.get(process.env.VC_KICK);
				const timeoutEmbed60 = new EmbedBuilder()
					.setTitle(`${member.user.username} was issued a 60 minute timeout!`)
					.addFields([
						{
							name: 'User',
							value: `<@${member.user.id}>\n\`${member.user.id}\``,
							inline: true,
						},
						{
							name: 'Expires',
							value: `<t:${unmuteTime}:t>\n<t:${unmuteTime}:R>`,
							inline: true,
						},
					])
					.setColor('E9BE1A');

				channel.send({ embeds: [timeoutEmbed60] });
			} else if (entryCount2 >= 2) {
				// member.timeout(600_000); Temporarily disable, set to 60 seconds for testing
				member.timeout(60_000);

				const unmuteTime = Math.floor(new Date(Date.now() + 10 * 60 * 1000) / 1000);

				// Send Log for 10 Minute Timeout
				const channel = interaction.guild.channels.cache.get(process.env.VC_KICK);
				const timeoutEmbed10 = new EmbedBuilder()
					.setTitle(`${member.user.username} was issued a 10 minute timeout!`)
					.addFields([
						{
							name: 'User',
							value: `<@${member.user.id}>\n\`${member.user.id}\``,
							inline: true,
						},
						{
							name: 'Expires',
							value: `<t:${unmuteTime}:t>\n<t:${unmuteTime}:R>`,
							inline: true,
						},
					])
					.setColor('1A6EC8');

				channel.send({ embeds: [timeoutEmbed10] });
			}
		} catch (error) {
			console.error(error);
			await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
		}
	},
};
