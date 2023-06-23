const chalk = require('chalk');
const moment = require('moment');
const dotenv = require('dotenv');
const Database = require('better-sqlite3');
const { Client, GatewayIntentBits } = require('discord.js');

const { loadEvents } = require('./events.js');

dotenv.config();

const client = new Client({
	intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates],
	allowedMentions: { users: [] },
});

// Connect to the SQLite database
const db = new Database(`${__dirname}/databases/vcOwnerList.sqlite`);
const db2 = new Database(`${__dirname}/databases/memberDecay.sqlite`);
const db3 = new Database(`${__dirname}/databases/savedLFGPosts.sqlite`);

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
CREATE TABLE IF NOT EXISTS vcOwnerList (
  id TEXT PRIMARY KEY
);
`;
db.exec(createTableQuery);

// Create tables to store member IDs and timestamps for kick counter
const createTableQuery2 = `
CREATE TABLE IF NOT EXISTS memberDecay1 (
  id TEXT, timestamp INTEGER,
  PRIMARY KEY (id, timestamp)
);
`;
const createTableQuery3 = `
CREATE TABLE IF NOT EXISTS memberDecay2 (
  id TEXT, timestamp INTEGER,
  PRIMARY KEY (id, timestamp)
);
`;
const createTableQuery4 = `
CREATE TABLE IF NOT EXISTS memberDecay3 (
  id TEXT, timestamp INTEGER,
  PRIMARY KEY (id, timestamp)
);
`;

db2.exec(createTableQuery2);
db2.exec(createTableQuery3);
db2.exec(createTableQuery4);

// Create a tables to store LFG data
const createTableQuery5 = `
  CREATE TABLE IF NOT EXISTS casualLFG (
    user_id TEXT PRIMARY KEY,
    mode TEXT,
    description TEXT,
    playerno TEXT,
    fieldmic TEXT,
    fieldp TEXT,
    fieldm TEXT,
    fieldg TEXT,
	timestamp
  );
`;
const createTableQuery6 = `
  CREATE TABLE IF NOT EXISTS rankedLFG (
    user_id TEXT PRIMARY KEY,
    description TEXT,
    playerno TEXT,
    fieldmic TEXT,
    fieldp TEXT,
    fieldm TEXT,
    fieldg TEXT,
	selectedrank TEXT,
	timestamp
  );
`;
db3.exec(createTableQuery5);
db3.exec(createTableQuery6);

function checkEntryPlural(amount, string) {
	if (amount == 1) {
		return `${string}y`;
	}

	return `${string}ies`;
}

// Deleting expiring kick counts
function deleteOldEntries2() {
	const tenMinutesAgo = moment().subtract(10, 'minutes').unix();

	// Select the amount of entries in memberDecay1 that are older than 10 minutes
	const tenMinuteCount = db2.prepare('SELECT COUNT(*) FROM memberDecay1 WHERE timestamp <= ?').get(tenMinutesAgo)['COUNT(*)'];

	// If the counter is greater than 0, delete the entries
	if (tenMinuteCount > 0) {
		console.log(chalk.cyan(`DATABASE: Running 10 Minute Kick Counter Cleanup Check...`));

		db2.prepare('DELETE FROM memberDecay1 WHERE timestamp <= ?').run(tenMinutesAgo);

		console.log(chalk.green(`DATABASE: 10 Minute Kick Counter Cleanup complete, deleted ${tenMinuteCount} ${checkEntryPlural(tenMinuteCount, 'entr')} from the database!`));
	}
}
setInterval(deleteOldEntries2, 60 * 1000);

function deleteOldEntries3() {
	// console.log(chalk.cyan(`DATABASE: Running 1 Hour Kick Counter Cleanup Check...`));

	const oneDayAgo1 = moment().subtract(1440, 'minutes').unix();
	db2.prepare('DELETE FROM memberDecay2 WHERE timestamp <= ?').run(oneDayAgo1);

	// console.log(chalk.green(`DATABASE: 1 Hour Kick Counter Cleanup Complete!`));
}
setInterval(deleteOldEntries3, 60 * 1000);

function deleteOldEntries4() {
	// console.log(chalk.cyan(`DATABASE: Running 28 Day Kick Counter Cleanup Check...`));

	const oneDayAgo2 = moment().subtract(1440, 'minutes').unix();
	db2.prepare('DELETE FROM memberDecay3 WHERE timestamp <= ?').run(oneDayAgo2);

	// console.log(chalk.green(`DATABASE: 28 Day Kick Counter Cleanup Complete!`));
}
setInterval(deleteOldEntries4, 60 * 1000);

// Deleting expiring casual lfg messages
function deleteOldEntries5() {
	// TODO: Proper logging for when cleanup tasks run
	// console.log(chalk.cyan(`DATABASE: Running 10 Minute saved LFG Cleanup Check...`));

	const twentyEightDaysAgo = moment().subtract(28, 'days').unix();
	db3.prepare('DELETE FROM casualLFG WHERE timestamp <= ?').run(twentyEightDaysAgo);

	// console.log(chalk.green(`DATABASE: 28 days saved LFG Cleanup Complete!`));
}
setInterval(deleteOldEntries5, 24 * 60 * 60 * 1000);

// Deleting expiring ranked lfg messages
function deleteOldEntries6() {
	// TODO: Proper logging for when cleanup tasks run
	// console.log(chalk.cyan(`DATABASE: Running 10 Minute saved LFG Cleanup Check...`));

	const sevenDaysAgo = moment().subtract(7, 'days').unix();
	db3.prepare('DELETE FROM rankedLFG WHERE timestamp <= ?').run(sevenDaysAgo);

	// console.log(chalk.green(`DATABASE: 7 days saved LFG Cleanup Complete!`));
}
setInterval(deleteOldEntries6, 24 * 60 * 60 * 1000);

module.exports = { client };
