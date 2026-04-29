const dotenv = require('dotenv');
const { emoteFileName } = require('./misc.js');
const categories = require('../data/categories.json');
const { ButtonStyle, ButtonBuilder } = require('discord.js');

dotenv.config({ quiet: true });

const emoteFile = require(`../data/emotes/${emoteFileName(process.env.DEBUG)}.json`);

function stitchEmotes(name, amount) {
	// loop through total amount of emotes, based on amount, and return string of full emote
	let emoteString = '';

	for (let i = 1; i <= amount; i++) {
		emoteString += `${emoteFile[`${name}_${i}`]}`;
	}

	return emoteString;
}

function isMicRequired(mic) {
	if (mic == true) return stitchEmotes('mic', '6');

	return stitchEmotes('nomic', '5');
}

function teammatesNeeded(user, amount) {
	const userText = `<@${user}>`;

	if (amount > 0) return `${userText} is looking for ${amount} teammate${amount > 1 ? 's' : ''}`;

	return `${userText} is looking for teammates`;
}

function createVoiceButton(interaction) {
	if (interaction.member.voice.channel)
		return new ButtonBuilder().setStyle(ButtonStyle.Link).setLabel('Join Voice').setEmoji('🔊').setURL(`https://discord.com/channels/${interaction.guild.id}/${interaction.member.voice.channel.id}`);

	return new ButtonBuilder().setStyle(ButtonStyle.Secondary).setLabel('User not in Voice Chat').setCustomId('voice_button_disabled').setDisabled(true);
}

function checkVoiceChannelCategory(member) {
	// Not in a VC
	if (!member.voice.channel) return false;

	// In a VC, but are in an allowed category
	if (categories.includes(member.voice.channel.parentId)) return false;

	return true;
}

module.exports = { stitchEmotes, isMicRequired, teammatesNeeded, createVoiceButton, checkVoiceChannelCategory };
