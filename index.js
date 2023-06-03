const moment = require('moment');
const dotenv = require('dotenv');
const Database = require('better-sqlite3');
const { Client, GatewayIntentBits } = require('discord.js');

const { loadEvents } = require('./events.js');

dotenv.config();

const client = new Client({
	intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates],
});

// Connect to the SQLite database
const db = new Database('database.sqlite');
const db2 = new Database('database2.sqlite');

client
	.login(process.env.TOKEN)
	.then(() => {
		loadEvents(client);
	})
	.catch(err => {
		console.error(`Error loading bot during login: ${err}`);
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

module.exports = { client };
