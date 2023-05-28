const { Client, GatewayIntentBits } = require('discord.js');

const { token } = require('./config.json');
const { loadEvents } = require('./events.js');

const client = new Client({
	intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates],
});

client
	.login(token)
	.then(() => {
		// Load the files for each event and run them
		loadEvents(client);
	})
	.catch(error => {
		console.log(`Error loading bot during login: ${error}`);
	});

// Just in case we need to get the client from another file
module.exports = { client };
