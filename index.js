const chalk = require('chalk');
const dotenv = require('dotenv');
const moment = require('moment');
const Database = require('better-sqlite3');
const { Client, GatewayIntentBits } = require('discord.js');

// Load utilities
const { checkEntryPlural } = require('./functions/utilities.js');

// Load client and interaction event handlers
const { loadEvents } = require('./events.js');

// Load .env config file
dotenv.config();

// Load client with guild and voice state intents
// Bot should have server members intent enabled in
// the developer portal, but to be safe, just enable
// all of the intents
const client = new Client({
	intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates],
	allowedMentions: { users: [] },
});

// Log the bot in to Discord and load the event handlers
client
	.login(process.env.TOKEN)
	.then(() => {
		loadEvents(client);
	})
	.catch(err => {
		console.log(chalk.bold.red(`BOT: Login Error: ${err}`));
	});

// Create and load database files
const db_vcOwnerList = new Database(`${__dirname}/databases/vcOwnerList.sqlite`);
const db_memberDecay = new Database(`${__dirname}/databases/memberDecay.sqlite`);
const db_savedLFGPosts = new Database(`${__dirname}/databases/savedLFGPosts.sqlite`);

// Create the quieries to create table if they don't exist
const createOwnerVCTable = `CREATE TABLE IF NOT EXISTS vcOwnerList (id TEXT PRIMARY KEY);`;

const createMemberDecayTable1 = `CREATE TABLE IF NOT EXISTS memberDecay1 (id TEXT, timestamp INTEGER, PRIMARY KEY (id, timestamp));`;
const createMemberDecayTable2 = `CREATE TABLE IF NOT EXISTS memberDecay2 (id TEXT, timestamp INTEGER, PRIMARY KEY (id, timestamp));`;
const createMemberDecayTable3 = `CREATE TABLE IF NOT EXISTS memberDecay3 (id TEXT, timestamp INTEGER, PRIMARY KEY (id, timestamp));`;

const createCasualLFGPostsTable = `CREATE TABLE IF NOT EXISTS casualLFG (
    user_id TEXT PRIMARY KEY,
    mode TEXT,
    description TEXT,
    playersNeeded TEXT,
    micRequired TEXT,
    playStyle TEXT,
    main TEXT,
    gamerTag TEXT,
    timestamp
);`;

const createRankedLFGPostsTable = `CREATE TABLE IF NOT EXISTS rankedLFG (
    user_id TEXT PRIMARY KEY,
    description TEXT,
    playersNeeded TEXT,
    micRequired TEXT,
    playStyle TEXT,
    main TEXT,
    gamerTag TEXT,
    selectedRank TEXT,
    timestamp
);`;

// Execute the queries to create the tables
db_vcOwnerList.exec(createOwnerVCTable);
db_memberDecay.exec(createMemberDecayTable1);
db_memberDecay.exec(createMemberDecayTable2);
db_memberDecay.exec(createMemberDecayTable3);
db_savedLFGPosts.exec(createCasualLFGPostsTable);
db_savedLFGPosts.exec(createRankedLFGPostsTable);

// Delete expired kick counts from database
function deleteKickCounterEntries(dbName, timeInMinutes, text) {
	// Subtract the amount of time (timeInMinutes) from the current time
	const timeSince = moment().subtract(timeInMinutes, 'minutes').unix();

	// Select the amount of rows that are older than timeSince
	const timeSinceCount = db_memberDecay.prepare(`SELECT COUNT(*) FROM ${dbName} WHERE timestamp <= ?`).get(timeSince)['COUNT(*)'];

	// If the count of timeSinceCount is greater than 0, delete the entries
	if (timeSinceCount > 0) {
		console.log(chalk.cyan(`DATABASE: Running ${text} Cleanup Check...`));

		db_memberDecay.prepare(`DELETE FROM ${dbName} WHERE timestamp <= ?`).run(timeSince);

		console.log(chalk.green(`DATABASE: ${text} Cleanup Check complete, deleted ${timeSinceCount} ${checkEntryPlural(timeSinceCount, 'entr')} from ${dbName}.`));
	}
}

// Delete expired kick counts from database
function deleteLFGPostEntries(dbName, timeInMinutes, text) {
	// Subtract the amount of time (timeInMinutes) from the current time
	const timeSince = moment().subtract(timeInMinutes, 'minutes').unix();

	// Select the amount of rows that are older than timeSince
	const timeSinceCount = db_savedLFGPosts.prepare(`SELECT COUNT(*) FROM ${dbName} WHERE timestamp <= ?`).get(timeSince)['COUNT(*)'];

	// If the count of timeSinceCount is greater than 0, delete the entries
	if (timeSinceCount > 0) {
		console.log(chalk.cyan(`DATABASE: Running ${text} Cleanup Check...`));

		db_savedLFGPosts.prepare(`DELETE FROM ${dbName} WHERE timestamp <= ?`).run(timeSince);

		console.log(chalk.green(`DATABASE: ${text} Cleanup Check complete, deleted ${timeSinceCount} ${checkEntryPlural(timeSinceCount, 'entr')} from ${dbName}.`));
	}
}

// 10 Minute Kick Counter Timer
// Ran every 10 minutes
setInterval(deleteKickCounterEntries, 60 * 1000, 'memberDecay1', 10, '10 Minute Timeout Counter');

// 1 Hour Kick Counter Timer
// Ran once a day
setInterval(deleteKickCounterEntries, 60 * 1000, 'memberDecay2', 24 * 60, '1 Hour Timeout Counter');

// 28 Day Kick Counter Timer
// Ran once a day
setInterval(deleteKickCounterEntries, 60 * 1000, 'memberDecay3', 24 * 60, '28 Day Timeout Counter');

// Saved Casual LFG Post Cleanup Timer
// Ran every 28 days
setInterval(deleteLFGPostEntries, 3600 * 1000, 'casualLFG', 28 * 24 * 60, 'Casual LFG Post');

// Saved Ranked LFG Post Cleanup Timer
// Ran every 7 days
setInterval(deleteLFGPostEntries, 3600 * 1000, 'rankedLFG', 7 * 24 * 60, 'Ranked LFG Post');

// Export the client so other files can use it
module.exports = { client };
