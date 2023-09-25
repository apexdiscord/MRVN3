const axios = require('axios');
const chalk = require('chalk');
const Database = require('better-sqlite3');
const db = require('../../functions/database.js');
const { InteractionType } = require('discord.js');

const db_vcOwnerList = new Database(`${__dirname}/../../databases/vcOwnerList.sqlite`);

module.exports = {
	name: 'interactionCreate',
	once: false,
	async execute(interaction, client) {
		if (interaction.isButton()) {
			const linkedUserRow = `SELECT * FROM specter WHERE discordID = ?`;

			db.query(linkedUserRow, [interaction.user.id], async (err, linkedUserRow) => {
				try {
					const response = await axios.get(
						`https://api.jumpmaster.xyz/user/MRVN_ID?platform=${linkedUserRow[0].platform}&id=${linkedUserRow[0].playerID}&key=${process.env.SPYGLASS}`,
					);
					const data = response.data;

					interaction.reply({
						content: `username: ${data.user.username}\nstatus: ${data.user.status.online} (probs offline LMAO)\nlevel: ${data.account.level.total}\nrank: ${data.ranked.name} ${data.ranked.score}\nlegend: ${data.active.legend}\n\n**trackers:**\nfirst: ${data.active.trackers[0].name}: ${data.active.trackers[0].value}\nsecond: ${data.active.trackers[1].name}: ${data.active.trackers[1].value}\nthird: ${data.active.trackers[2].name}: ${data.active.trackers[2].value}`,
						ephemeral: true,
					});
				} catch (e) {
					console.log(e);
				}
			});
		}

		if (interaction.type === InteractionType.ApplicationCommand) {
			const command = client.commands.get(interaction.commandName);

			if (!command) return;

			const hasPermission = !command.requiresPermission || db_vcOwnerList.prepare(`SELECT * FROM vcOwnerList WHERE id = ?`).get(interaction.user.id);

			if (hasPermission) {
				// The user running the command has permission as either they are the owner of the voice channel or the command does not require permission to run
				try {
					await command.execute(interaction, client);
				} catch (error) {
					console.log(chalk.red(`${chalk.bold('[BOT]')} Error running /${command.data.name}: ${error}`));

					// await interaction.deferReply({ ephemeral: true });

					await interaction.editReply({
						content: 'There was an error while executing this command!',
						ephemeral: true,
					});
				}
			} else {
				// If the user is not in a voice channel, reply with an error. This should only happen on commands where the commands requires permission to run
				if (!interaction.member.voice.channel) {
					await interaction.deferReply({ ephemeral: true });

					await interaction.editReply({
						content: 'You must be in a voice channel to use this command.',
						ephemeral: true,
					});

					return;
				}

				await interaction.deferReply({ ephemeral: true });

				await interaction.editReply({
					content: 'You do not have permission to use this command.',
					ephemeral: true,
				});
			}
		}
	},
};
