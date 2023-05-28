const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, GatewayIntentBits } = require('discord.js');
const { token } = require('./config.json');
const Database = require('better-sqlite3');
const moment = require('moment');

const client = new Client({
	intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates],
});

client.commands = new Collection();
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

// Add command names that require permission
const commandsRequiringPermission = ['kick'];

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}

		if (commandsRequiringPermission.includes(command.data.name)) {
			command.requiresPermission = true;
		} else {
			command.requiresPermission = false;
		}
	}
}

// Connect to the SQLite database
const db = new Database('database.sqlite');
const db2 = new Database('database2.sqlite');

// Bot ready and delete any existing tables to avoid conflicts on bot restart
client.once('ready', () => {
	console.log('Ready!');

	db.prepare('DELETE FROM members').run();
	db2.prepare('DELETE FROM members2').run();
	db2.prepare('DELETE FROM members3').run();
	db2.prepare('DELETE FROM members4').run();
});

// Updating commands
client.once('ready', async () => {
	try {
		// Delete all registered slash commands. Only useful
		// for debugging, should not be used in production.
		// await client.application.commands.set([]);

		const commands = client.commands.map(command => command.data);

		await client.application.commands.set(commands);

		console.log('Slash commands deployed or updated successfully!');
	} catch (error) {
		console.error('Failed to deploy or update slash commands:', error);
	}
});

// Create tables to store member IDs for kick permission
const createTableQuery = `
  CREATE TABLE IF NOT EXISTS members (
    id TEXT PRIMARY KEY
  );
`;
db.exec(createTableQuery);

// Create tables to store member IDs and timestamps for kick counter
const createTableQuery2 = `
  CREATE TABLE IF NOT EXISTS members2 (
    id TEXT, timestamp INTEGER,
    PRIMARY KEY (id, timestamp)
  );
`;
const createTableQuery3 = `
  CREATE TABLE IF NOT EXISTS members3 (
    id TEXT, timestamp INTEGER,
    PRIMARY KEY (id, timestamp)
  );
`;
const createTableQuery4 = `
  CREATE TABLE IF NOT EXISTS members4 (
    id TEXT, timestamp INTEGER,
    PRIMARY KEY (id, timestamp)
  );
`;
db2.exec(createTableQuery2);
db2.exec(createTableQuery3);
db2.exec(createTableQuery4);

// Deleting expiring kick counts
function deleteOldEntries2() {
	const tenMinutesAgo = moment().subtract(10, 'minutes').unix();
	db2.prepare('DELETE FROM members2 WHERE timestamp <= ?').run(tenMinutesAgo);
}
setInterval(deleteOldEntries2, 60 * 1000);

function deleteOldEntries3() {
	const oneDayAgo1 = moment().subtract(1440, 'minutes').unix();
	db2.prepare('DELETE FROM members3 WHERE timestamp <= ?').run(oneDayAgo1);
}
setInterval(deleteOldEntries3, 60 * 1000);

function deleteOldEntries4() {
	const oneDayAgo2 = moment().subtract(1440, 'minutes').unix();
	db2.prepare('DELETE FROM members4 WHERE timestamp <= ?').run(oneDayAgo2);
}
setInterval(deleteOldEntries4, 60 * 1000);

// Check if member has the command permission
client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return;

	const command = client.commands.get(interaction.commandName);

	if (!command) return;

	const memberId = interaction.member.id;
	const hasPermission = !command.requiresPermission || db.prepare('SELECT id FROM members WHERE id = ?').get(memberId);

	if (hasPermission) {
		try {
			await command.execute(interaction);
		} catch (error) {
			console.error(error);
			await interaction.reply({
				content: 'There was an error while executing this command!',
				ephemeral: true,
			});
		}
	} else {
		await interaction.reply({
			content: 'You do not have permission to use this command.',
			ephemeral: true,
		});
	}
});

// logic for commands that require permission (empty voice channel only)
client.on('voiceStateUpdate', (oldState, newState) => {
	const guild = newState.guild;
	const voiceChannel = newState.channel;
	const member = newState.member;
	const previousChannel = oldState.channel;
	const newChannel = newState.channel;
	const memberId = newState.member.id;

	// Check if the user joined an empty voice channel
	if (voiceChannel && voiceChannel.members.size === 1) {
		console.log(`User ${newState.member.user.tag} joined an empty voice channel in ${guild.name}`);
		const insertQuery = 'INSERT INTO members (id) VALUES (?)';
		db.prepare(insertQuery).run(memberId);
	}
	// Check if a member left a voice channel
	if (previousChannel && !newChannel) {
		console.log(`Member ${member.user.tag} left voice channel ${previousChannel.name}`);
		const deleteQuery = 'DELETE FROM members WHERE id = ?';
		db.prepare(deleteQuery).run(memberId);
	}

	// Check if a member moved to a different voice channel
	if (previousChannel && newChannel && previousChannel.id !== newChannel.id) {
		console.log(`Member ${member.user.tag} moved from ${previousChannel.name} to ${newChannel.name}`);
		const deleteQuery = 'DELETE FROM members WHERE id = ?';
		db.prepare(deleteQuery).run(memberId);
	}
});

client.login(token);
