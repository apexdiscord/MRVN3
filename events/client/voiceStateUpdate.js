const chalk = require('chalk');
const dotenv = require('dotenv');
const Database = require('better-sqlite3');

dotenv.config();

// Connect to the SQLite database
const db = new Database(`${__dirname}/../../databases/vcOwnerList.sqlite`);

// Grab the vc category whitelist
var categoryWhitelist = require('../../data/categoryWhitelist.json');

module.exports = {
	name: 'voiceStateUpdate',
	once: false,
	execute(oldState, newState) {
		// oldState and newState variables
		const guild = newState.guild;
		const member = newState.member;

		// Set timestamp for logging
		const logTimestamp = Math.floor(Date.now() / 1000);

		// User Join
		if (oldState.channelId === null) {
			// If the parent category of the VC is not in the list, ignore it
			if (!categoryWhitelist.includes(newState.channel.parent.id)) return;

			if (newState.channel.members.size === 1) {
				// User joined Empty VC
				// Log the join in the console for debugging
				console.log(chalk.green(`JOIN: ${member.user.tag} Joined Empty VC "${newState.channel.name}"`));

				// Log it in channel for reports
				if (process.env.VC_JOIN !== undefined) {
					const channel = guild.channels.cache.get(process.env.VC_JOIN);
					channel.send(
						`<t:${logTimestamp}:f> :microphone2: <:MRVN_Join:1118671133802246296> <@${member.user.id}> (**${member.user.tag}**, \`${member.user.id}\`) Joined Empty VC: <#${newState.channel.id}> (**${newState.channel.name}**, \`${newState.channel.id}\`)`,
					);
				}

				// Check if user already exists in DB
				const findUser = 'SELECT id FROM vcOwnerList WHERE id = ?';
				const findUserResult = db.prepare(findUser).get(member.user.id);

				if (!findUserResult) {
					// User is not in DB, just insert
					const addVCOwner = 'INSERT INTO vcOwnerList (id) VALUES (?)';
					db.prepare(addVCOwner).run(member.user.id);

					console.log(chalk.blue(`DATABASE: Added ${member.user.tag} (${member.user.id}) to the database.`));
				} else {
					// User is in DB, remove then readd them
					// May be redundant? Not sure if it's needed, look
					// into it in the future if it becomes an issue
					const removeVCOwner = 'DELETE FROM vcOwnerList WHERE id = ?';
					db.prepare(removeVCOwner).run(member.user.id);

					console.log(chalk.cyan(`DATABASE: Removed ${member.user.tag} (${member.user.id}) from the database.`));

					const addVCOwner = 'INSERT INTO vcOwnerList (id) VALUES (?)';
					db.prepare(addVCOwner).run(member.user.id);

					console.log(chalk.blue(`DATABASE: Added ${member.user.tag} (${member.user.id}) to the database.`));
				}
			} else {
				// User joined a non-empty VC
				// Log the join in the console for debugging
				console.log(chalk.green(`JOIN: ${member.user.tag} Joined Occupied VC "${newState.channel.name}"`));

				// Log it in channel for reports
				if (process.env.VC_JOIN !== undefined) {
					const channel = guild.channels.cache.get(process.env.VC_JOIN);
					channel.send(
						`<t:${logTimestamp}:f> :microphone2: <:MRVN_Join:1118671133802246296> <@${member.user.id}> (**${member.user.tag}**, \`${member.user.id}\`) Joined Occupied VC: <#${newState.channel.id}> (**${newState.channel.name}**, \`${newState.channel.id}\`)`,
					);
				}
			}
		} else if (newState.channelId === null) {
			// User Leave
			// If the parent category of the VC is not in the list, ignore it
			if (!categoryWhitelist.includes(oldState.channel.parent.id)) return;

			// Log the join in the console for debugging
			console.log(chalk.red(`LEAVE: ${member.user.tag} Left VC "${oldState.channel.name}"`));

			// Check if user already exists in DB
			const findUser = 'SELECT id FROM vcOwnerList WHERE id = ?';
			const findUserResult = db.prepare(findUser).get(member.user.id);

			if (findUserResult) {
				// User is in DB, remove them
				const deleteVCOwner = 'DELETE FROM vcOwnerList WHERE id = ?';
				db.prepare(deleteVCOwner).run(member.user.id);

				console.log(chalk.cyan(`DATABASE: Removed ${member.user.tag} (${member.user.id}) from the database.`));

				// If they are in the DB, set the channel limit back to 3
				// If they aren't, then there's no point setting it back
				// to 3 if they don't own the VC
				if (oldState.channel != null && oldState.channel.parent.id != process.env.GEN_CAT) {
					oldState.channel.setUserLimit(3);
				}
			}

			// Log it in channel for reports
			if (process.env.VC_LEAVE !== undefined) {
				const channel = guild.channels.cache.get(process.env.VC_LEAVE);
				channel.send(
					`<t:${logTimestamp}:f> :microphone2: <:MRVN_Leave:1118671155960762489> <@${member.user.id}> (**${member.user.tag}**, \`${member.user.id}\`) Left VC: <#${oldState.channel.id}> (**${oldState.channel.name}**, \`${oldState.channel.id}\`)`,
				);
			}
		} else if (oldState.channelId != newState.channelId) {
			// User Move
			// If the parent category of the VC is not in the list, ignore it
			if (!categoryWhitelist.includes(newState.channel.parent.id)) return;

			if (newState.channel.members.size === 1) {
				// User moved to an empty VC
				// Log the join in the console for debugging
				console.log(chalk.yellow(`MOVE: ${member.user.tag} Moved to Empty VC "${newState.channel.name}"`));

				// Log it in channel for reports
				if (process.env.VC_MOVE !== undefined) {
					const channel = guild.channels.cache.get(process.env.VC_MOVE);
					channel.send(
						`<t:${logTimestamp}:f> :microphone2: <:MRVN_Move:1118671145034596474> <@${member.user.id}> (**${member.user.tag}**, \`${member.user.id}\`) Moved to Empty VC: <#${newState.channel.id}> (**${newState.channel.name}**, \`${newState.channel.id}\`)`,
					);
				}

				// Check if the user is already in the DB
				// If they are, remove and readd
				// If they aren't, just add them
				// Check if user already exists in DB
				const findUser = 'SELECT id FROM vcOwnerList WHERE id = ?';
				const findUserResult = db.prepare(findUser).get(member.user.id);

				if (!findUserResult) {
					// User is not in DB, just insert
					const addVCOwner = 'INSERT INTO vcOwnerList (id) VALUES (?)';
					db.prepare(addVCOwner).run(member.user.id);

					console.log(chalk.blue(`DATABASE: Added ${member.user.tag} (${member.user.id}) to the database.`));
				} else {
					// User is in DB, remove then readd them
					// May be redundant? Not sure if it's needed, look
					// into it in the future if it becomes an issue
					const removeVCOwner = 'DELETE FROM vcOwnerList WHERE id = ?';
					db.prepare(removeVCOwner).run(member.user.id);

					console.log(chalk.cyan(`DATABASE: Removed ${member.user.tag} (${member.user.id}) from the database.`));

					const addVCOwner = 'INSERT INTO vcOwnerList (id) VALUES (?)';
					db.prepare(addVCOwner).run(member.user.id);

					console.log(chalk.blue(`DATABASE: Added ${member.user.tag} (${member.user.id}) to the database.`));

					// Also, set the previous VC channel limit back to 3
					if (oldState.channel != null && oldState.channel.parent.id != process.env.GEN_CAT) {
						oldState.channel.setUserLimit(3);
					}
				}
			} else {
				// User moved to occupied VC
				// Log the join in the console for debugging
				console.log(chalk.yellow(`MOVE: ${member.user.tag} Moved to Occupied VC "${newState.channel.name}"`));

				// Log it in channel for reports
				if (process.env.VC_MOVE !== undefined) {
					const channel = guild.channels.cache.get(process.env.VC_MOVE);
					channel.send(
						`<t:${logTimestamp}:f> :microphone2: <:MRVN_Move:1118671145034596474> <@${member.user.id}> (**${member.user.tag}**, \`${member.user.id}\`) Moved to Occupied VC: <#${newState.channel.id}> (**${newState.channel.name}**, \`${newState.channel.id}\`)`,
					);
				}

				// If user exists in DB but moves to a VC they
				// don't own, remove them
				// Check if user already exists in DB
				const findUser = 'SELECT id FROM vcOwnerList WHERE id = ?';
				const findUserResult = db.prepare(findUser).get(member.user.id);

				if (findUserResult) {
					// User is in DB, remove them
					const deleteVCOwner = 'DELETE FROM vcOwnerList WHERE id = ?';
					db.prepare(deleteVCOwner).run(member.user.id);

					console.log(chalk.cyan(`DATABASE: Removed ${member.user.tag} (${member.user.id}) from the database.`));

					// Also, set the previous VC channel limit back to 3
					if (oldState.channel != null && oldState.channel.parent.id != process.env.GEN_CAT) {
						oldState.channel.setUserLimit(3);
					}
				}
			}
		}
	},
};
