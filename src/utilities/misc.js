const chalk = require('chalk');
const dotenv = require('dotenv');
const { ContainerBuilder, TextDisplayBuilder } = require('discord.js');

dotenv.config({ quiet: true });

const emoteFile = require(`../data/emotes/${emoteFileName(process.env.DEBUG)}.json`);

function uptimeText() {
	const uptime = process.uptime();
	const minutes = `${Math.floor((uptime % (60 * 60)) / 60)} Minutes`;
	const hours = `${Math.floor((uptime / (60 * 60)) % 24)} Hours`;
	const days = `${Math.floor(uptime / 86400)} Days`;
	const seconds = `${Math.floor(uptime % 60)} Seconds`;

	return `${days}, ${hours}, ${minutes}, ${seconds}`;
}

function errorDisplay(title, text, type) {
	if (type == 'warning') emote = emoteFile.warning;
	else if (type == 'danger') emote = emoteFile.danger;
	else emote = emoteFile.help;

	const errorContainer = new ContainerBuilder().addTextDisplayComponents(new TextDisplayBuilder().setContent(`# ${emote} ${title}\n${text}`));

	return errorContainer;
}

function emoteFileName(debug) {
	if (debug === 'true') return 'dev';

	return 'prod';
}

function uptimeConsole() {
	(function uptimeLoop() {
		const uptime = process.uptime();
		const minutes = `${Math.floor((uptime % (60 * 60)) / 60)} Minutes`;
		const hours = `${Math.floor((uptime / (60 * 60)) % 24)} Hours`;
		const days = `${Math.floor(uptime / 86400)} Days`;

		console.log(`${chalk.blue.bold('[MRVN]')} Uptime: ${days}, ${hours}, ${minutes}`);

		now = new Date();
		var delay = 60000 - (now % 60000);
		setTimeout(uptimeLoop, delay);
	})();
}

module.exports = { uptimeText, errorDisplay, emoteFileName, uptimeConsole };
