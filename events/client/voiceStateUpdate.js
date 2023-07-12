const chalk = require('chalk');
const moment = require('moment');
const Database = require('better-sqlite3');

const db_vcOwnerList = new Database(`${__dirname}/../../databases/vcOwnerList.sqlite`);

const { logFormatter, checkVoiceChannel, movedLogFormatter } = require('../../functions/utilities.js');
var categoryWhitelist = require('../../data/categoryWhitelist.json');

module.exports = {
	name: 'voiceStateUpdate',
	once: false,
	execute(oldState, newState) {
		// User Join
		if (oldState.channelId === null) {
			// If the parent category of the voice channel is not in the whitelist, ignore it
			if (!categoryWhitelist.includes(newState.channel.parent.id)) return;

			if (newState.channel.members.size === 1) {
				// User joined an empty VC
				console.log(chalk.green(`${chalk.bold('JOIN:')} ${newState.member.user.tag} joined empty voice channel "${newState.channel.name}"`));

				// Log it in the log channel
				if (process.env.VC_JOIN !== undefined) {
					const logChannel = newState.guild.channels.cache.get(process.env.VC_JOIN);

					logChannel.send(logFormatter(newState, 'Joined'));
				}

				// dbTimestamp
				const dbTimestamp = moment().unix();

				// Insert or replace the person in the vcOwnerList
				db_vcOwnerList.prepare('INSERT OR REPLACE INTO vcOwnerList (id, timestamp) VALUES (?, ?)').run(newState.member.user.id, dbTimestamp);

				console.log(chalk.blue(`${chalk.bold('DATABASE:')} Added ${oldState.member.user.tag} to vcOwnerList`));
			} else {
				// User join a non-empty VC
				console.log(chalk.green(`${chalk.bold('JOIN:')} ${newState.member.user.tag} joined occupied voice channel "${newState.channel.name}"`));

				// Log it in the log channel
				if (process.env.VC_JOIN !== undefined) {
					const logChannel = newState.guild.channels.cache.get(process.env.VC_JOIN);

					logChannel.send(logFormatter(newState, 'Joined'));
				}
			}
		} else if (newState.channelId === null) {
			// User left VC
			// If the parent category of the voice channel is not in the whitelist, ignore it
			if (!categoryWhitelist.includes(oldState.channel.parent.id)) return;

			console.log(chalk.red(`${chalk.bold('LEAVE:')} ${oldState.member.user.tag} left voice channel "${oldState.channel.name}"`));

			// Check to see if the user exists in vcOwnerList
			const findUser = db_vcOwnerList.prepare('SELECT * FROM vcOwnerList WHERE id = ?').get(oldState.member.user.id);

			if (findUser) {
				// User is in vcOwnerList, remove them
				db_vcOwnerList.prepare('DELETE FROM vcOwnerList WHERE id = ?').run(oldState.member.user.id);

				console.log(chalk.blue(`${chalk.bold('DATABASE:')} Removed ${oldState.member.user.tag} from vcOwnerList`));

				// If they are in the DB, set the channel limit back
				// to 3. If they aren't, do nothing, as they don't own the
				// VC or are in a VC that should not be changed at all
				if (checkVoiceChannel(oldState) == false && oldState.channel.userLimit != 3) {
					oldState.channel.setUserLimit(3);

					console.log(chalk.yellow(`${chalk.bold('VOICE:')} Set user limit of "${oldState.channel.name}" to 3`));
				}

				// Log it in the log channel
				if (process.env.VC_LEAVE !== undefined) {
					const logChannel = newState.guild.channels.cache.get(process.env.VC_LEAVE);

					logChannel.send(logFormatter(oldState, 'Left'));
				}
			}
		} else if (oldState.channelId != newState.channelId) {
			// User moved
			// If the parent category of the voice channel is
			// not in the whitelist, ignore it
			if (!categoryWhitelist.includes(oldState.channel.parent.id)) {
				// Disconnect the user and force them to reconnect
				// ...simply because I'm too lazy to figure out the
				// logic needed to make this work properly (atm)
				newState.member.voice.disconnect();

				return;
			}

			// If the new VC is not in the whitelist, remove
			// any VC owner entries for the user
			if (!categoryWhitelist.includes(newState.channel.parent.id)) {
				// User moved to a VC that is not in the
				// category whitelist
				console.log(chalk.yellow(`${chalk.bold('LEAVE:')} ${oldState.member.user.tag} left voice channel "${oldState.channel.name}"`));

				const findUser = db_vcOwnerList.prepare('SELECT * FROM vcOwnerList WHERE id = ?').get(oldState.member.user.id);

				if (findUser) {
					db_vcOwnerList.prepare('DELETE FROM vcOwnerList WHERE id = ?').run(oldState.member.user.id);

					console.log(chalk.blue(`${chalk.bold('DATABASE:')} Removed ${oldState.member.user.tag} from vcOwnerList`));
				}

				if (checkVoiceChannel(oldState) == false && oldState.channel.userLimit != 3) {
					oldState.channel.setUserLimit(3);

					console.log(chalk.yellow(`${chalk.bold('VOICE:')} Set user limit of "${oldState.channel.name}" to 3`));
				}

				// Log it in the log channel
				if (process.env.VC_LEAVE !== undefined) {
					const logChannel = newState.guild.channels.cache.get(process.env.VC_LEAVE);

					logChannel.send(logFormatter(oldState, 'Left'));
				}

				return;
			}

			if (newState.channel.members.size === 1) {
				// User moved to an empty VC
				console.log(chalk.yellow(`${chalk.bold('MOVE:')} ${newState.member.user.tag} moved from "${oldState.channel.name}" to "${newState.channel.name}"`));

				// Log it in the log channel
				if (process.env.VC_MOVE !== undefined) {
					const logChannel = newState.guild.channels.cache.get(process.env.VC_MOVE);

					logChannel.send(movedLogFormatter(oldState, newState));
				}

				// dbTimestamp
				const dbTimestamp = moment().unix();

				// Find out if the user owned the previous VC. If they did,
				// set the limit of it back to 3 (just in case)
				const findUser = db_vcOwnerList.prepare('SELECT * FROM vcOwnerList WHERE id = ?').get(oldState.member.user.id);

				if (findUser && checkVoiceChannel(oldState) == false && oldState.channel.userLimit != 3) {
					// Set the vc limit back to 3
					oldState.channel.setUserLimit(3);
				}

				// Insert or replace the person in the vcOwnerList
				db_vcOwnerList.prepare('INSERT OR REPLACE INTO vcOwnerList (id, timestamp) VALUES (?, ?)').run(newState.member.user.id, dbTimestamp);

				console.log(chalk.blue(`${chalk.bold('DATABASE:')} ${oldState.member.user.tag} moved to an empty VC; database entry inserted or updated`));
			} else {
				// User moved to an occupied VC
				console.log(chalk.yellow(`${chalk.bold('MOVE:')} ${newState.member.user.tag} moved from "${oldState.channel.name}" to "${newState.channel.name}"`));

				// Log it in the log channel
				if (process.env.VC_MOVE !== undefined) {
					const logChannel = newState.guild.channels.cache.get(process.env.VC_MOVE);

					logChannel.send(movedLogFormatter(oldState, newState));
				}

				// Find out if the user owned the previous VC. If they did,
				// set the limit of it back to 3 (just in case) and remove them from the vcOwnerList
				const findUser = db_vcOwnerList.prepare('SELECT * FROM vcOwnerList WHERE id = ?').get(oldState.member.user.id);

				if (findUser) {
					// Set the previous VC back to 3
					if (checkVoiceChannel(oldState) == false && oldState.channel.userLimit != 3) {
						// Set the vc limit back to 3
						oldState.channel.setUserLimit(3);

						console.log(chalk.yellow(`${chalk.bold('VOICE:')} Set user limit of "${oldState.channel.name}" to 3`));
					}

					db_vcOwnerList.prepare('DELETE FROM vcOwnerList WHERE id = ?').run(newState.member.user.id);

					console.log(chalk.blue(`${chalk.bold('DATABASE:')} Removed ${oldState.member.user.tag} from vcOwnerList`));
				}
			}
		}
	},
};
