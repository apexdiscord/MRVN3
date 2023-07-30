const chalk = require('chalk');
const dotenv = require('dotenv');
const moment = require('moment');
const Database = require('better-sqlite3');
const db = require('./functions/database.js');
const { Table } = require('console-table-printer');
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
	allowedMentions: { parse: ['roles'], repliedUser: true },
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
// const db_memberSlowmode = new Database(`${__dirname}/databases/memberSlowmode.sqlite`);

// Create the quieries to create table if they don't exist
const createOwnerVCTable = `CREATE TABLE IF NOT EXISTS vcOwnerList (id TEXT, timestamp INTEGER, PRIMARY KEY (id));`;

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
    timestamp INTEGER
);`;

const createRankedLFGPostsTable = `CREATE TABLE IF NOT EXISTS rankedLFG (
    user_id TEXT PRIMARY KEY,
    mode TEXT,
    description TEXT,
    currentRank TEXT,
    previousRank TEXT,
    playersNeeded TEXT,
    micRequired TEXT,
    playStyle TEXT,
    main TEXT,
    gamerTag TEXT,
    timestamp INTEGER
);`;

// const createSlowmodeTable = `CREATE TABLE IF NOT EXISTS memberSlowmode (
//     user_id TEXT PRIMARY KEY,
//     timestamp INTEGER
// );`;

// Execute the queries to create the tables
db_vcOwnerList.exec(createOwnerVCTable);
// db_memberSlowmode.exec(createSlowmodeTable);
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

		console.log(chalk.green(`DATABASE: ${text} Cleanup Check complete, deleted ${timeSinceCount} ${checkEntryPlural(timeSinceCount, 'entr')} from ${dbName}`));
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

		console.log(chalk.green(`DATABASE: ${text} Cleanup Check complete, deleted ${timeSinceCount} ${checkEntryPlural(timeSinceCount, 'entr')} from ${dbName}`));
	}
}

// Delete expired slowmode entries from the database
// if the last update to `timestamp` is older than 6 hours
function deleteSlowmodeEntries() {
	// Subtract the amount of time (timeInMinutes) from the current time
	const timeSince = moment().subtract(6, 'hours').unix();

	// Select the amount of rows that are older than timeSince
	const timeSinceCount = `SELECT COUNT(*) FROM userSlowmodeTheSecond WHERE postTimestamp <= ?`;

	db.query(timeSinceCount, timeSince, (err, result) => {
		if (err) {
			console.log(chalk.bold.red(`OVERWATCH: Error: ${err}`));
		}

		const rowCount = result[0]['count(*)'];

		// If the count of timeSinceCount is greater than 0, delete the entries
		if (rowCount > 0) {
			console.log(chalk.cyan(`OVERWATCH: Running Slowmode Cleanup Check...`));

			const deleteOldSlowmodeEntries = `DELETE FROM userSlowmodeTheSecond WHERE postTimestamp <= ?`;

			db.query(deleteOldSlowmodeEntries, timeSince, (err, result) => {
				if (err) {
					console.log(chalk.bold.red(`OVERWATCH: Error: ${err}`));
				}
			});

			console.log(chalk.green(`OVERWATCH: Slowmode Cleanup Check complete, deleted ${rowCount} ${checkEntryPlural(rowCount, 'entr')} from userSlowmodeTheSecond`));
		}
	});
}

function currentBotStats() {
	// The idea is to run a command that spits out information to
	// the console about current DB counts and such. Maybe in the
	// future it'll update a message in the server for easier
	// viewing.
	const minutes = moment().minute();

	if (minutes % 30 == 0) {
		const oneHourAgo = moment().subtract(1, 'hour').unix();
		const twoHoursAgo = moment().subtract(2, 'hour').unix();

		const savedCasualPostCount = db_savedLFGPosts.prepare(`SELECT COUNT(*) FROM casualLFG`).get()['COUNT(*)'];
		const savedRankedPostCount = db_savedLFGPosts.prepare(`SELECT COUNT(*) FROM rankedLFG`).get()['COUNT(*)'];
		const timeoutEntryCount1 = db_memberDecay.prepare(`SELECT COUNT(*) FROM memberDecay1`).get()['COUNT(*)'];
		const timeoutEntryCount2 = db_memberDecay.prepare(`SELECT COUNT(*) FROM memberDecay2`).get()['COUNT(*)'];
		const timeoutEntryCount3 = db_memberDecay.prepare(`SELECT COUNT(*) FROM memberDecay3`).get()['COUNT(*)'];
		const vcOwnerCountTotal = db_vcOwnerList.prepare(`SELECT COUNT(*) FROM vcOwnerList`).get()['COUNT(*)'];
		const vcOwnerCountOneHour = db_vcOwnerList.prepare(`SELECT COUNT(*) FROM vcOwnerList WHERE timestamp <= ${oneHourAgo}`).get()['COUNT(*)'];
		const vcOwnerCountTwoHours = db_vcOwnerList.prepare(`SELECT COUNT(*) FROM vcOwnerList WHERE timestamp <= ${twoHoursAgo}`).get()['COUNT(*)'];

		const savedPostCountTable = new Table({
			title: `Saved LFG Post Count`,
			columns: [
				{ name: 'casualSavedCount', title: 'Saved Casual LFG Posts' },
				{ name: 'rankedSavedCount', title: 'Saved Ranked LFG Posts' },
			],
		});

		savedPostCountTable.addRows([
			{
				casualSavedCount: savedCasualPostCount,
				rankedSavedCount: savedRankedPostCount,
			},
		]);

		const timeoutCountTable = new Table({
			title: `Timeout Entry Count`,
			columns: [
				{ name: 'timeoutCount1', title: '10m Timeout Entries' },
				{ name: 'timeoutCount2', title: '1h Timeout Entries' },
				{ name: 'timeoutCount3', title: '28d Timeout Entries' },
			],
		});

		timeoutCountTable.addRows([
			{
				timeoutCount1: timeoutEntryCount1,
				timeoutCount2: timeoutEntryCount2,
				timeoutCount3: timeoutEntryCount3,
			},
		]);

		const vcOwnerCountTable = new Table({
			title: `Number of VC Owners`,
			columns: [
				{ name: 'vcOwnerCountTotal', title: 'Total VC Owners' },
				{ name: 'vcOwnerCountOneHour', title: 'VC Owners [1+ Hours]' },
				{ name: 'vcOwnerCountTwoHours', title: 'VC Owners [2+ Hours]' },
			],
		});

		vcOwnerCountTable.addRows([
			{
				vcOwnerCountTotal: vcOwnerCountTotal,
				vcOwnerCountOneHour: vcOwnerCountOneHour,
				vcOwnerCountTwoHours: vcOwnerCountTwoHours,
			},
		]);

		savedPostCountTable.printTable();
		timeoutCountTable.printTable();
		vcOwnerCountTable.printTable();
	}
}

// Bot Stats Timer
// Runs once a minute, but only actually prints to the counter
// on the 30th minute of the hour
setInterval(currentBotStats, 60 * 1000);

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

// Slowmode Cleanup Timer
// Ran once an hour
setInterval(deleteSlowmodeEntries, 3600 * 1000);

// Export the client so other files can use it
module.exports = { client };
