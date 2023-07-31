const chalk = require('chalk');
var database = require('mysql2');
const dotenv = require('dotenv');

var db;
dotenv.config();

function databaseConnection() {
	if (!db) {
		db = database.createPool({
			host: process.env.DB_HOST,
			database: process.env.DB_NAME,
			user: process.env.DB_USER,
			password: process.env.DB_PASS,
			port: 3306,
			waitForConnections: true,
			connectionLimit: 15,
			queueLimit: 0,
			maxIdle: 15,
			idleTimeout: 30000,
			enableKeepAlive: true,
			ssl: {},
		});

		db.getConnection(err => {
			if (err) {
				console.log(chalk.red(`${chalk.bold(`OVERWATCH:`)} Error connecting to database: ${err}`));
			} else {
				console.log(chalk.blue(`${chalk.bold(`OVERWATCH:`)} Database connection complete`));
			}
		});
	}

	return db;
}

module.exports = databaseConnection();
