const { Client, GatewayIntentBits } = require("discord.js");

const { token } = require("./config.json");
const { loadEvents } = require("./events.js");

const client = new Client({
	intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates],
});

client
	.login(token)
	.then(() => {
		loadEvents(client);
	})
	.catch((error) => {
		console.log(`Error loading bot during login: ${error}`);
	});

module.exports = { client };
