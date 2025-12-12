const fs = require('fs');
const chalk = require('chalk');

function loadEvents(client) {
	console.log(`${chalk.yellow.bold('[MRVN_EVENTS]')} Loading Event Handler...`);

	const folders = fs.readdirSync(`${__dirname}/events`);

	for (const folder of folders) {
		const files = fs.readdirSync(`${__dirname}/events/${folder}`).filter(file => file.endsWith('.js'));

		for (const file of files) {
			const event = require(`./events/${folder}/${file}`);

			if (event.rest) {
				if (event.once) {
					client.rest.once(event.name, (...args) => event.execute(...args, client));
				} else {
					client.rest.on(event.name, (...args) => event.execute(...args, client));
				}
			} else {
				if (event.once) {
					client.once(event.name, (...args) => event.execute(...args, client));
				} else {
					client.on(event.name, (...args) => event.execute(...args, client));
				}
			}

			console.log(`${chalk.green.bold('[MRVN_EVENTS]')} Loaded ${chalk.green(file)} Event Handler`);
		}
	}
}

module.exports = { loadEvents };
