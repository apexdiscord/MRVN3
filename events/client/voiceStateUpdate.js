const Database = require('better-sqlite3');

// Connect to the SQLite database
const db = new Database('database.sqlite');
const db2 = new Database('database2.sqlite');

module.exports = {
	name: 'voiceStateUpdate',
	once: false,
	execute(oldState, newState) {
		const guild = newState.guild;
		const voiceChannel = newState.channel;
		const member = newState.member;
		const previousChannel = oldState.channel;
		const newChannel = newState.channel;
		const memberId = newState.member.id;

		// Check if the user joined an empty voice channel
		if (voiceChannel && voiceChannel.members.size === 1) {
			console.log(`User ${newState.member.user.tag} joined an empty voice channel in ${guild.name}`);

			// Check if id already exists in db
			const selectQuery = 'SELECT id FROM vcOwnerList WHERE id = ?';
			const selectResult = db.prepare(selectQuery).get(memberId);

			// If id exists delete it
			if (selectResult) {
				const deleteQuery = 'DELETE FROM vcOwnerList WHERE id = ?';
				db.prepare(deleteQuery).run(memberId);
			}

			// Insert the row into the 'vcOwnerList' table
			const insertQuery = 'INSERT INTO vcOwnerList (id) VALUES (?)';
			db.prepare(insertQuery).run(memberId);
		}
		// Check if a member left a voice channel
		if (previousChannel && !newChannel) {
			console.log(`Member ${member.user.tag} left voice channel ${previousChannel.name}`);
			const deleteQuery = 'DELETE FROM vcOwnerList WHERE id = ?';
			db.prepare(deleteQuery).run(memberId);

			// set the user limit of the voice channel back to 3
			previousChannel.setUserLimit(3);
		}

		// Check if a member moved to a different voice channel
		if (previousChannel && newChannel && previousChannel.id !== newChannel.id) {
			console.log(`Member ${member.user.tag} moved from ${previousChannel.name} to ${newChannel.name}`);
			const deleteQuery = 'DELETE FROM vcOwnerList WHERE id = ?';
			db.prepare(deleteQuery).run(memberId);

			// set the user limit of the previous channel to 3 (just in case)
			previousChannel.setUserLimit(3);

			// Check if a member moved to an empty voice channel
			if (newChannel && newChannel.members.size === 1) {
				console.log(`User ${newState.member.user.tag} joined an empty voice channel in ${guild.name}`);

				// Insert the row into the 'vcOwnerList' table
				const insertQuery = 'INSERT INTO vcOwnerList (id) VALUES (?)';
				db.prepare(insertQuery).run(memberId);
			}
		}
	},
};
