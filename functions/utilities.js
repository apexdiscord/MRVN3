const chalk = require('chalk');
const moment = require('moment');
const Database = require('better-sqlite3');
const { ButtonStyle, ButtonBuilder } = require('discord.js');

const emotes = require('../data/emotes.json');
var bannedWords = require('../data/bannedWords.json');
const db_savedLFGPosts = new Database(`${__dirname}/../databases/savedLFGPosts.sqlite`);

function setVCLimit(mode, channel) {
	if (!channel.member.voice.channel) return;

	if (mode == 'Duos') {
		if (channel.member.voice.channel.userLimit != 2) {
			channel.member.voice.channel.setUserLimit(2);

			return console.log(chalk.yellow(`${chalk.bold('VOICE:')} Set user limit of "${channel.member.voice.channel.name}" to 2`));
		}

		return;
	} else if (mode == 'Trios') {
		channel.member.voice.channel.setUserLimit(3);

		if (channel.member.voice.channel.userLimit != 3) {
			return console.log(chalk.yellow(`${chalk.bold('VOICE:')} Set user limit of "${channel.member.voice.channel.name}" to 3`));
		}
	}
}

function logFormatter(state, text, type) {
	var logTimestamp = moment().unix();

	if (type == 0) var amountText = ' Empty';
	if (type == 1) var amountText = ' Occupied';
	if (type == 2) var amountText = '\u200b';

	return `<t:${logTimestamp}:f> :microphone2: ${emotes[text]} <@${state.member.user.id}> (**${state.member.user.tag}**, \`${state.member.user.id}\`) ${text}${amountText} VC <#${state.channel.id}> (**${state.channel.name}**, \`${state.channel.id}\`)`;
}

function checkBannedWords(message, interaction) {
	if (!message) return false;

	if (bannedWords.some(i => message.toLowerCase().includes(i))) {
		console.log(chalk.red(`USER WARNING: ${interaction.member.displayName} tried to use a banned word in their LFG message`));

		interaction.editReply({
			content: 'Your LFG message contains a banned word. Please try again.',
			ephemeral: true,
		});

		return true;
	}

	return false;
}

function checkEntryPlural(amount, string) {
	if (amount == 1) return `${string}y`;

	return `${string}ies`;
}

function checkVoiceChannel(voice) {
	if (voice.channel && (voice.channel.parentId == process.env.GEN_CATEGORY || voice.channel.parentId == process.env.EVENT_CATEGORY)) return true;

	return false;
}

function saveCasualLFGPost(interaction, mode, description, playersNeeded, micRequired, playstyle, mains, gamertag) {
	const timestamp = moment().unix();

	const insertLFGPost = db_savedLFGPosts.prepare(
		`INSERT OR REPLACE INTO casualLFG (user_id, mode, description, playersNeeded, micRequired, playStyle, main, gamerTag, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
	);

	insertLFGPost.run(interaction.user.id, mode, description, playersNeeded, micRequired, playstyle, mains, gamertag, timestamp);

	console.log(chalk.blue(`DATABASE: Saved LFG post from ${interaction.user.tag} to casualLFG table`));
}

function vcLinkButtonBuilder(interaction) {
	if (!interaction.member.voice.channel) return null;

	return new ButtonBuilder()
		.setLabel(`Join "${interaction.member.voice.channel.name}"`)
		.setStyle(ButtonStyle.Link)
		.setEmoji('🔊')
		.setURL(`https://discord.com/channels/${interaction.guild.id}/${interaction.member.voice.channel.id}`);
}

module.exports = { setVCLimit, logFormatter, checkBannedWords, checkEntryPlural, checkVoiceChannel, saveCasualLFGPost, vcLinkButtonBuilder };