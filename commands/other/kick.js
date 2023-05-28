const { SlashCommandBuilder } = require('@discordjs/builders');
const Database = require('better-sqlite3');
const db2 = new Database('database2.sqlite', { verbose: console.log });
const moment = require('moment');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('kick')
		.setDescription('Removes a member from their current voice channel.')
		.addUserOption(option =>
			option.setName('member-name')
				.setDescription('The member to be removed from their voice channel.')
				.setRequired(true)),
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
			const insertEntry2 = db2.prepare(`
  			INSERT INTO members2 (id, timestamp)
  			VALUES (?, ?)
			`);
			insertEntry2.run(userId, timestamp);

			const insertEntry3 = db2.prepare(`
  			INSERT INTO members3 (id, timestamp)
  			VALUES (?, ?)
			`);
			insertEntry3.run(userId, timestamp);

			const insertEntry4 = db2.prepare(`
  			INSERT INTO members4 (id, timestamp)
  			VALUES (?, ?)
			`);
			insertEntry4.run(userId, timestamp);

			// Fetch the database count of id
			const stmt2 = db2.prepare('SELECT COUNT(*) AS entry_count2 FROM members2 WHERE id = ?');
			const stmt3 = db2.prepare('SELECT COUNT(*) AS entry_count3 FROM members3 WHERE id = ?');
			const stmt4 = db2.prepare('SELECT COUNT(*) AS entry_count4 FROM members4 WHERE id = ?');

			// Execute the query and fetch the result
			const result2 = stmt2.get(userId);
			const result3 = stmt3.get(userId);
			const result4 = stmt4.get(userId);

			// Fetch the entry count
			const entryCount2 = result2.entry_count2;
			const entryCount3 = result3.entry_count3;
			const entryCount4 = result4.entry_count4;

			// Display the entry count
			const response2 = `The count of specific entry is: ${entryCount2}`;
			console.log(response2);
			const response3 = `The count of specific entry is: ${entryCount3}`;
			console.log(response3);
			const response4 = `The count of specific entry is: ${entryCount4}`;
			console.log(response4);

			// Timeouts
			if (entryCount2 >= 2) {
				member.timeout(600_000);
			}
			if (entryCount3 >= 6) {
				member.timeout(3600_000);
			}
			if (entryCount4 >= 9) {
				member.timeout(2419200_000);
			}

		}
		catch (error) {
			console.error(error);
			await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
		}
	},
};