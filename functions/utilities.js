const chalk = require('chalk');
const moment = require('moment');
const Database = require('better-sqlite3');
const { ButtonStyle, EmbedBuilder, ButtonBuilder } = require('discord.js');

const emotes = require('../data/emotes.json');
var bannedWords = require('../data/bannedWords.json');
const db_savedLFGPosts = new Database(`${__dirname}/../databases/savedLFGPosts.sqlite`);

function setVCLimit(mode, channel) {
	if (!channel.member.voice.channel) return;

	if (mode == 'Duos' || mode == '1v1') {
		if (channel.member.voice.channel.userLimit != 2) {
			channel.member.voice.channel.setUserLimit(2);

			return console.log(chalk.yellow(`${chalk.bold('VOICE:')} Set user limit of "${channel.member.voice.channel.name}" to 2`));
		}

		return;
	} else if (mode == 'Trios' || mode == 'LTM' || mode == 'Mixtape' || mode == 'Provisional' || mode == 'Ranked') {
		if (channel.member.voice.channel.userLimit != 3) {
			channel.member.voice.channel.setUserLimit(3);

			return console.log(chalk.yellow(`${chalk.bold('VOICE:')} Set user limit of "${channel.member.voice.channel.name}" to 3`));
		}
	}
}

function logFormatter(state, text) {
	var logTimestamp = moment().unix();

	return `<t:${logTimestamp}:f> :microphone2: ${emotes[text]} <@${state.member.user.id}> (**${state.member.user.tag}**, \`${state.member.user.id}\`) ${text} <#${state.channel.id}> (**${state.channel.name}**, \`${state.channel.id}\`)`;
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

function checkBannedWordsCustom(message, interaction) {
	if (!message) return false;

	if (bannedWords.some(i => message.toLowerCase().includes(i))) {
		console.log(chalk.red(`USER WARNING: ${interaction.member.displayName} tried to use a banned word in their LFG message`));

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

function movedLogFormatter(oldState, newState) {
	var logTimestamp = moment().unix();

	return `<t:${logTimestamp}:f> :microphone2: ${emotes['Moved']} <@${newState.member.user.id}> (**${newState.member.user.tag}**, \`${newState.member.user.id}\`) Moved From <#${oldState.channel.id}> (**${oldState.channel.name}**, \`${oldState.channel.id}\`) to <#${newState.channel.id}> (**${newState.channel.name}**, \`${newState.channel.id}\`)`;
}

function saveCasualLFGPost(interaction, mode, description, playersNeeded, micRequired, playstyle, mains, gamertag) {
	const timestamp = moment().unix();

	const insertLFGPost = db_savedLFGPosts.prepare(
		`INSERT OR REPLACE INTO casualLFG (user_id, mode, description, playersNeeded, micRequired, playStyle, main, gamerTag, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
	);

	insertLFGPost.run(interaction.user.id, mode, description, playersNeeded, micRequired, playstyle, mains, gamertag, timestamp);

	console.log(chalk.blue(`DATABASE: Saved LFG post from ${interaction.user.tag} to casualLFG table`));
}

function saveRankedLFGPost(interaction, mode, description, currentRank, previousRank, playersNeeded, micRequired, playstyle, mains, gamertag) {
	const timestamp = moment().unix();

	const insertLFGPost = db_savedLFGPosts.prepare(
		`INSERT OR REPLACE INTO rankedLFG (user_id, mode, description, currentRank, previousRank, playersNeeded, micRequired, playStyle, main, gamerTag, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
	);

	insertLFGPost.run(interaction.user.id, mode, description, currentRank, previousRank, playersNeeded, micRequired, playstyle, mains, gamertag, timestamp);

	console.log(chalk.blue(`DATABASE: Saved LFG post from ${interaction.user.tag} to rankedLFG table`));
}

async function timeoutController(length, lengthFull, memberKicked, interaction, entryOne, entryTwo, entryThree) {
	const unmuteTimestamp = Math.floor(new Date(Date.now() + lengthFull) / 1000);

	if (length == 2419199_000) {
		var textTitle = `${memberKicked.user.tag} was issued a 28 day timeout!`;
		var textInfo = `Thier timeout will expire <t:${unmuteTimestamp}:R>, <t:${unmuteTimestamp}:d> at <t:${unmuteTimestamp}:t>`;
		var embedColor = 'CA2128';

		memberKicked.timeout(length, 'User was timed out for 28 days due to being kicked from an LFG channel 9 or more times in the past 24 hours.').catch(console.error);
	} else if (length == 3600_000) {
		var textTitle = `${memberKicked.user.tag} was issued a 1 hour timeout!`;
		var textInfo = `Their timeout will expire <t:${unmuteTimestamp}:R>, at <t:${unmuteTimestamp}:t>`;
		var embedColor = 'E9BE1A';

		memberKicked.timeout(length, 'User was timed out for 1 hour due to being kicked from an LFG channel 6 or more times in the past 24 hours.').catch(console.error);
	} else if (length == 600_000) {
		var textTitle = `${memberKicked.user.tag} was issued a 10 minute timeout!`;
		var textInfo = `Their timeout will expire <t:${unmuteTimestamp}:R>, at <t:${unmuteTimestamp}:t>`;
		var embedColor = '1A6EC8';

		memberKicked.timeout(length, 'User was timed out for 10 minutes due to being kicked from an LFG channel 3 or more times in the past hour.').catch(console.error);
	} else {
		var textTitle = `${memberKicked.user.tag} was kicked from a voice channel!`;
		var textInfo = 'They were kicked, but were not issued a timeout.';
		var embedColor = '1A6EC8';
	}

	const kickChannel = interaction.guild.channels.cache.get(process.env.VC_KICK);

	const timeoutEmbed = new EmbedBuilder()
		.setTitle(`${textTitle}`)
		.setDescription(`${textInfo}`)
		.addFields([
			{
				name: 'Kicked User',
				value: `<@${memberKicked.user.id}>\n\`${memberKicked.user.id}\``,
				inline: true,
			},
			{
				name: 'Kicked By',
				value: `<@${interaction.user.id}>\n\`${interaction.user.id}\``,
				inline: true,
			},
			{
				name: 'Voice Channel',
				value: `<#${memberKicked.voice.channelId}>\n\`${memberKicked.voice.channelId}\``,
				inline: true,
			},
			{
				name: '10m Timeout Count',
				value: `${entryOne}`,
				inline: true,
			},
			{
				name: '1h Timeout Count',
				value: `${entryTwo}`,
				inline: true,
			},
			{
				name: '28d Timeout Count',
				value: `${entryThree}`,
				inline: true,
			},
		])
		.setTimestamp()
		.setColor(embedColor);

	kickChannel.send({ embeds: [timeoutEmbed] });

	await memberKicked.voice.disconnect();
}

function vcLinkButtonBuilder(interaction) {
	if (!interaction.member.voice.channel) return null;

	return new ButtonBuilder()
		.setLabel(`Join "${interaction.member.voice.channel.name}"`)
		.setStyle(ButtonStyle.Link)
		.setEmoji('🔊')
		.setURL(`https://discord.com/channels/${interaction.guild.id}/${interaction.member.voice.channel.id}`);
}

module.exports = {
	setVCLimit,
	logFormatter,
	checkBannedWords,
	checkEntryPlural,
	checkVoiceChannel,
	movedLogFormatter,
	saveCasualLFGPost,
	saveRankedLFGPost,
	timeoutController,
	vcLinkButtonBuilder,
	checkBannedWordsCustom,
};
