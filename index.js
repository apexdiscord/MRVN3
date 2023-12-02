const chalk = require('chalk');
const dotenv = require('dotenv');
const moment = require('moment');
const Database = require('better-sqlite3');
const db = require('./functions/database.js');
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

const process = require('node:process');

process.on('unhandledRejection', async (reason, promise) => {
	console.log(chalk.red(`${chalk.bold('[BOT]')} Unhandled Rejection at: ${promise}, reason:, ${reason}`));
});

process.on('uncaughtException', err => {
	console.log(chalk.red(`${chalk.bold('[BOT]')} Unhandled Exception: ${err}`));
});

process.on('uncaughtExceptionMonitor', (err, origin) => {
	console.log(chalk.red(`${chalk.bold('[BOT]')} Uncaught Exception Monitor: ${err}, ${origin}`));
});

// Log the bot in to Discord and load the event handlers
client
	.login(process.env.TOKEN)
	.then(() => {
		loadEvents(client);
	})
	.catch(err => {
		console.log(chalk.red(`${chalk.bold('[BOT]')} Login Error: ${err}`));
	});

// Create and load database files
const db_vcOwnerList = new Database(`${__dirname}/databases/vcOwnerList.sqlite`);
const db_memberDecay = new Database(`${__dirname}/databases/memberDecay.sqlite`);
// const db_savedLFGPosts = new Database(`${__dirname}/databases/savedLFGPosts.sqlite`);
// const db_memberSlowmode = new Database(`${__dirname}/databases/memberSlowmode.sqlite`);

// Create the quieries to create table if they don't exist
const createOwnerVCTable = `CREATE TABLE IF NOT EXISTS vcOwnerList (id TEXT, timestamp INTEGER, PRIMARY KEY (id));`;

const createMemberDecayTable1 = `CREATE TABLE IF NOT EXISTS memberDecay1 (id TEXT, timestamp INTEGER, PRIMARY KEY (id, timestamp));`;
const createMemberDecayTable2 = `CREATE TABLE IF NOT EXISTS memberDecay2 (id TEXT, timestamp INTEGER, PRIMARY KEY (id, timestamp));`;
const createMemberDecayTable3 = `CREATE TABLE IF NOT EXISTS memberDecay3 (id TEXT, timestamp INTEGER, PRIMARY KEY (id, timestamp));`;

// const createCasualLFGPostsTable = `CREATE TABLE IF NOT EXISTS casualLFG (
//     user_id TEXT PRIMARY KEY,
//     mode TEXT,
//     description TEXT,
//     playersNeeded TEXT,
//     micRequired TEXT,
//     playStyle TEXT,
//     main TEXT,
//     gamerTag TEXT,
//     timestamp INTEGER
// );`;

// const createRankedLFGPostsTable = `CREATE TABLE IF NOT EXISTS rankedLFG (
//     user_id TEXT PRIMARY KEY,
//     mode TEXT,
//     description TEXT,
//     currentRank TEXT,
//     previousRank TEXT,
//     playersNeeded TEXT,
//     micRequired TEXT,
//     playStyle TEXT,
//     main TEXT,
//     gamerTag TEXT,
//     timestamp INTEGER
// );`;

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
// db_savedLFGPosts.exec(createCasualLFGPostsTable);
// db_savedLFGPosts.exec(createRankedLFGPostsTable);

// Delete expired kick counts from database
function deleteKickCounterEntries(dbName, timeInMinutes, text) {
	// Subtract the amount of time (timeInMinutes) from the current time
	const timeSince = moment().subtract(timeInMinutes, 'minutes').unix();

	// Select the amount of rows that are older than timeSince
	const timeSinceCount = db_memberDecay.prepare(`SELECT COUNT(*) FROM ${dbName} WHERE timestamp <= ?`).get(timeSince)['COUNT(*)'];

	// If the count of timeSinceCount is greater than 0, delete the entries
	if (timeSinceCount > 0) {
		console.log(chalk.cyan(`${chalk.bold('[DATABASE]')} Running ${text} Cleanup Check...`));

		db_memberDecay.prepare(`DELETE FROM ${dbName} WHERE timestamp <= ?`).run(timeSince);

		console.log(
			chalk.green(`${chalk.bold('[DATABASE]')} ${text} Cleanup Check complete, deleted ${timeSinceCount} ${checkEntryPlural(timeSinceCount, 'entr')} from ${dbName}`),
		);
	}
}

// Delete expired link accounts (accounts that were not linked)
function deleteExpiredAccountLinks(dbName, timeInMinutes, text) {
	// Subtract the amount of time (timeInMinutes) from the current time
	const timeSince = moment().subtract(timeInMinutes, 'minutes').unix();

	// Select the amount of rows that are older than timeSince
	db.query(`SELECT COUNT(*) AS count FROM ${dbName} WHERE expiry < ?`, [timeSince], async (err, row) => {
		if (err) console.log(err);

		if (parseInt(row[0]['count']) >= 1) {
			console.log(chalk.cyan(`${chalk.bold('[OVERWATCH]')} Running ${text} Cleanup Check...`));

			// Select the amount of rows that are older than timeSince
			db.query(`DELETE FROM ${dbName} WHERE expiry < ?`, [timeSince], async (err, row) => {
				if (err) return console.log(err);

				console.log(
					chalk.green(
						`${chalk.bold('[OVERWATCH]')} ${text} Cleanup Check complete, deleted ${row.affectedRows} ${checkEntryPlural(row.affectedRows, 'entr')} from ${dbName}`,
					),
				);
			});
		}
	});
}

// Delete expired kick counts from database
function deleteLFGPostEntries(dbName, timeInMinutes, text) {
	// Subtract the amount of time (timeInMinutes) from the current time
	const timeSince = moment().subtract(timeInMinutes, 'minutes').unix();

	// Select the amount of rows that are older than timeSince
	const timeSinceCount = `SELECT COUNT(*) FROM ${dbName} WHERE timestamp <= ?`;

	db.query(timeSinceCount, timeSince, (err, result) => {
		if (err) {
			console.log(chalk.bold.red(`${chalk.bold('[OVERWATCH]')} Error: ${err}`));
		}

		// If the count of timeSinceCount is greater than 0, delete the entries
		if (result[0]['count(*)'] > 0) {
			console.log(chalk.cyan(`${chalk.bold('[OVERWATCH]')} Running ${text} Cleanup Check...`));

			const deleteLFGPosts = `DELETE FROM ${dbName} WHERE timestamp <= ?`;

			db.query(deleteLFGPosts, timeSince, (err, result) => {
				if (err) {
					console.log(chalk.bold.red(`${chalk.bold('[OVERWATCH]')} Error: ${err}`));
				}
			});

			console.log(
				chalk.green(
					`${chalk.bold('[OVERWATCH]')} ${text} Cleanup Check complete, deleted ${result[0]['count(*)']} ${checkEntryPlural(
						result[0]['count(*)'],
						'entr',
					)} from ${dbName}`,
				),
			);
		}
	});
}

// Delete expired slowmode entries from the database
// if the last update to `timestamp` is older than 6 hours
function deleteSlowmodeEntries() {
	// Subtract the amount of time (timeInMinutes) from the current time
	const timeSince = moment().subtract(6, 'hours').unix();

	// Select the amount of rows that are older than timeSince
	const timeSinceCount = `SELECT COUNT(*) FROM userPostSlowmode WHERE postTimestamp <= ?`;

	db.query(timeSinceCount, timeSince, (err, result) => {
		if (err) {
			console.log(chalk.bold.red(`${chalk.bold('[OVERWATCH]')} Error: ${err}`));
		}

		const rowCount = result[0]['count(*)'];

		// If the count of timeSinceCount is greater than 0, delete the entries
		if (rowCount > 0) {
			console.log(chalk.cyan(`${chalk.bold('[OVERWATCH]')} Running Slowmode Cleanup Check...`));

			const deleteOldSlowmodeEntries = `DELETE FROM userPostSlowmode WHERE postTimestamp <= ?`;

			db.query(deleteOldSlowmodeEntries, timeSince, (err, result) => {
				if (err) {
					console.log(chalk.bold.red(`${chalk.bold('[OVERWATCH]')} Error: ${err}`));
				}
			});

			console.log(
				chalk.green(`${chalk.bold('[OVERWATCH]')} Slowmode Cleanup Check complete, deleted ${rowCount} ${checkEntryPlural(rowCount, 'entr')} from userPostSlowmode`),
			);
		}
	});
}

// 10 Minute Kick Counter Timer
// Ran every 10 minutes
setInterval(deleteKickCounterEntries, 60 * 1000, 'memberDecay1', 10, '10 Minute Timeout Counter');

// Link Account Cleanup Timer
// Ran every 5 minutes
setInterval(deleteExpiredAccountLinks, 60 * 1000, 'temp_linking', 15, 'Linked Account');

// 1 Hour Kick Counter Timer
// Ran once a day
setInterval(deleteKickCounterEntries, 60 * 1000, 'memberDecay2', 24 * 60, '1 Hour Timeout Counter');

// 28 Day Kick Counter Timer
// Ran once a day
setInterval(deleteKickCounterEntries, 60 * 1000, 'memberDecay3', 24 * 60 * 3, '28 Day Timeout Counter');

// Saved Casual LFG Post Cleanup Timer
// Ran every 28 days
setInterval(deleteLFGPostEntries, 3600 * 1000, 'savedCasualLFGPosts', 28 * 24 * 60, 'Casual LFG Post');

// Saved Ranked LFG Post Cleanup Timer
// Ran every 7 days
setInterval(deleteLFGPostEntries, 3600 * 1000, 'savedRankedLFGPosts', 7 * 24 * 60, 'Ranked LFG Post');

// Slowmode Cleanup Timer
// Ran once an hour
setInterval(deleteSlowmodeEntries, 3600 * 1000);

// Export the client so other files can use it
module.exports = { client };
