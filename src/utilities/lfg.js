const dotenv = require('dotenv');
const { emoteFileName } = require('./misc.js');
const categories = require('../data/categories.json');

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

function checkVoiceChannelCategory(member) {
	// Not in a VC
	if (!member.voice.channel) return false;

	// In a VC, but are in an allowed category
	if (categories.includes(member.voice.channel.parentId)) return false;

	return true;
}

module.exports = { stitchEmotes, checkVoiceChannelCategory };
