const categories = require('../data/categories.json');

function checkVoiceChannelCategory(member) {
	// Not in a VC
	if (!member.voice.channel) return false;

	// In a VC, but are in an allowed category
	if (categories.includes(member.voice.channel.parentId)) return false;

	return true;
}

module.exports = { checkVoiceChannelCategory };
