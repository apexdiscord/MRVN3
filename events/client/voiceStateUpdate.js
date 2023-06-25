const chalk = require('chalk');
const Database = require('better-sqlite3');

const db_vcOwnerList = new Database(`${__dirname}/../../databases/vcOwnerList.sqlite`);

const { logFormatter } = require('../../functions/utilities.js');
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

					logChannel.send(logFormatter(newState, 'Joined', 0));
				}

				// Check to see if the user exists in vcOwnerList
				const findUser = db_vcOwnerList.prepare('SELECT * FROM vcOwnerList WHERE id = ?').get(newState.member.user.id);

				if (!findUser) {
					// If not, just insert them
					db_vcOwnerList.prepare('INSERT INTO vcOwnerList (id) VALUES (?)').run(newState.member.user.id);

					console.log(chalk.blue(`${chalk.bold('DATABASE:')} Added ${newState.member.user.tag} to vcOwnerList`));
				}
			} else {
				// User join a non-empty VC
				console.log(chalk.green(`${chalk.bold('JOIN:')} ${newState.member.user.tag} joined occupied voice channel "${newState.channel.name}"`));

				// Log it in the log channel
				if (process.env.VC_JOIN !== undefined) {
					const logChannel = newState.guild.channels.cache.get(process.env.VC_JOIN);

					logChannel.send(logFormatter(newState, 'Joined', 1));
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
				if (
					oldState.channel != null &&
					oldState.channel.parent.id != process.env.GEN_CATEGORY &&
					oldState.channel.parent.id != process.env.EVENT_CATEGORY &&
					oldState.channel.userLimit != 3
				) {
					oldState.channel.setUserLimit(3);

					console.log(chalk.yellow(`${chalk.bold('VOICE:')} Set user limit of "${oldState.channel.name}" to 3`));
				}

				// Log it in the log channel
				if (process.env.VC_LEAVE !== undefined) {
					const logChannel = newState.guild.channels.cache.get(process.env.VC_LEAVE);

					logChannel.send(logFormatter(oldState, 'Left', 2));
				}
			}
		} else if (oldState.channelId != newState.channelId) {
			// User moved
			// If the parent category of the voice channel is not in the whitelist, ignore it
			if (!categoryWhitelist.includes(oldState.channel.parent.id)) return;

			if (newState.channel.members.size === 1) {
				// Do stuff
			}
		}
	},
};
