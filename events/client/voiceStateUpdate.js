const chalk = require('chalk');
const moment = require('moment');
const Database = require('better-sqlite3');

const db_vcOwnerList = new Database(`${__dirname}/../../databases/vcOwnerList.sqlite`);

const { logFormatter } = require('../../functions/utilities.js');
var categoryWhitelist = require('../../data/categoryWhitelist.json');

module.exports = {
	name: 'voiceStateUpdate',
	once: false,
	execute(oldState, newState) {
		const logTimestamp = moment().unix();

		// User Join
		if (oldState.channelId === null) {
			// If the parent category of the voice channel is no in the whitelist, ignore it
			if (!categoryWhitelist.includes(newState.channel.parent.id)) return;

			if (newState.channel.members.size === 1) {
				// User joined an empty VC
				console.log(chalk.green(`${chalk.bold('JOIN:')} ${newState.member.user.tag} joined empty VC "${newState.channel.name}"`));

				// Log it in the log channel
				if (process.env.VC_JOIN !== undefined) {
					const logChannel = newState.guild.channels.cache.get(process.env.VC_JOIN);

					logChannel.send(logFormatter(newState, 'Joined', 0));
				}
			}
		}
	},
};
