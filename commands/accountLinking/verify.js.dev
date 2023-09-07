const axios = require('axios');
const Database = require('../../functions/database.js');
const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder().setName('verify').setDescription('Verify your Apex account. Use this command after running /link.'),

	async execute(interaction) {
		await interaction.deferReply({ ephemeral: true });

		// select the user account from the api
		// select the linked account form the database
		// if the account matches, start verification

		// check first tracker, api and database match, move onto second tracker
		// check second tracker, api and database match, move onto third tracker
		// check third tracker, api and database match, verification complete

		// FIRST: add the discord id, player id, and platform to specter
		// remove the temp link from temp_linking
		// send an embed, "success!!!!!!"

		// if any of the trackers don't match, send an embed, "verification failed, please try again"
		// ideally, it would be at which tracker the verification failed
		// (if possible? maybe? kinda. a lotta effort :3)

		const discordID = interaction.user.id;

		Database.query('SELECT COUNT(*) AS count FROM specter WHERE discordID = ?', [discordID], async (err, row) => {
			if (err) console.log(err);

			if (row[0]['count'] >= 1) {
				console.log('u already have a linked account. haha :3');

				return interaction.editReply('u already have an account linked. post an lfg post or use /unlink to unlink ur account');
			}

			Database.query('SELECT *, COUNT(*) AS count FROM temp_linking WHERE discordID = ?', [discordID], async (err, row) => {
				if (err) console.log(err);

				if (row[0]['count'] < 1) {
					console.log('no account found. oops. :3');

					return interaction.editReply('could not find an account to verify. use /link to start the process');
				}

				const verifyEmbed = new EmbedBuilder()
					.setTitle('Account Verification')
					.setDescription('Verifying your Apex account. Please wait...')
					.addFields([
						{
							name: 'Legend',
							value: 'Checking Legend...',
						},
						{
							name: 'Tracker 1',
							value: 'Checking your first tracker...',
						},
						{
							name: 'Tracker 2',
							value: 'Checking your second tracker...',
						},
						{
							name: 'Tracker 3',
							value: 'Checking your third tracker...',
						},
					]);

				await interaction.editReply({ content: '', embeds: [verifyEmbed] });

				const response = await axios.get(
					`https://api.jumpmaster.xyz/user/MRVN_ID?platform=${row[0]['platform']}&id=${encodeURIComponent(row[0]['playerID'])}&key=${process.env.SPYGLASS}`,
				);
				const data = response.data;

				if (data.active.legend == row[0]['legend']) {
					const verifyEmbed = new EmbedBuilder()
						.setTitle('Account Verification')
						.setDescription('Verifying your Apex account. Please wait...')
						.addFields([
							{
								name: 'Legend',
								value: `${row[0]['legend']} ✅`,
							},
							{
								name: 'Tracker 1',
								value: 'Checking your first tracker...',
							},
							{
								name: 'Tracker 2',
								value: 'Checking your second tracker...',
							},
							{
								name: 'Tracker 3',
								value: 'Checking your third tracker...',
							},
						]);

					await interaction.editReply({ content: '', embeds: [verifyEmbed] });

					if (data.active.trackers[0].id == row[0]['trackerOneID']) {
						const verifyEmbed = new EmbedBuilder()
							.setTitle('Account Verification')
							.setDescription('Verifying your Apex account. Please wait...')
							.addFields([
								{
									name: 'Legend',
									value: `${row[0]['legend']} ✅`,
								},
								{
									name: 'Tracker 1',
									value: 'trcker 1 ✅',
								},
								{
									name: 'Tracker 2',
									value: 'Checking your second tracker...',
								},
								{
									name: 'Tracker 3',
									value: 'Checking your third tracker...',
								},
							]);

						await interaction.editReply({ content: '', embeds: [verifyEmbed] });

						if (data.active.trackers[1].id == row[0]['trackerTwoID']) {
							const verifyEmbed = new EmbedBuilder()
								.setTitle('Account Verification')
								.setDescription('Verifying your Apex account. Please wait...')
								.addFields([
									{
										name: 'Legend',
										value: `${row[0]['legend']} ✅`,
									},
									{
										name: 'Tracker 1',
										value: 'trcker 1 ✅',
									},
									{
										name: 'Tracker 2',
										value: 'tracker 2 ✅',
									},
									{
										name: 'Tracker 3',
										value: 'Checking your third tracker...',
									},
								]);

							await interaction.editReply({ content: '', embeds: [verifyEmbed] });

							if (data.active.trackers[2].id == row[0]['trackerThreeID']) {
								const verifyEmbed = new EmbedBuilder()
									.setTitle('Account Verification')
									.setDescription('Verifying your Apex account. Please wait...')
									.addFields([
										{
											name: 'Legend',
											value: `${row[0]['legend']} ✅`,
										},
										{
											name: 'Tracker 1',
											value: 'trcker 1 ✅',
										},
										{
											name: 'Tracker 2',
											value: 'tracker 2 ✅',
										},
										{
											name: 'Tracker 3',
											value: 'tracker 3 ✅',
										},
									]);

								await interaction.editReply({ content: '', embeds: [verifyEmbed] });

								Database.query(
									'INSERT INTO specter (discordID, playerID, platform) VALUES (?, ?, ?)',
									[discordID, row[0]['playerID'], row[0]['platform']],
									async (err, row) => {
										if (err) console.log(err);

										console.log('inserted into specter :3');

										Database.query('DELETE FROM temp_linking WHERE discordID = ?', [discordID], async (err, row) => {
											if (err) console.log(err);

											const verifyEmbed = new EmbedBuilder()
												.setTitle('Account Verification')
												.setDescription('account verified! ur stats will now show up in lfg posts. u can type `/unlink` to unlink ur account.');

											await interaction.editReply({ content: '', embeds: [verifyEmbed] });
										});
									},
								);
							} else {
								const verifyEmbed = new EmbedBuilder()
									.setTitle('Account Verification')
									.setDescription('Verifying your Apex account. Please wait...')
									.addFields([
										{
											name: 'Legend',
											value: `${row[0]['legend']} ✅`,
										},
										{
											name: 'Tracker 1',
											value: 'trcker 1 ✅',
										},
										{
											name: 'Tracker 2',
											value: 'tracker 2 ✅',
										},
										{
											name: 'Tracker 3',
											value: 'tracker 3 ❌',
										},
									]);

								await interaction.editReply({ content: '', embeds: [verifyEmbed] });

								return;
							}
						} else {
							const verifyEmbed = new EmbedBuilder()
								.setTitle('Account Verification')
								.setDescription('Verifying your Apex account. Please wait...')
								.addFields([
									{
										name: 'Legend',
										value: `${row[0]['legend']} ✅`,
									},
									{
										name: 'Tracker 1',
										value: 'trcker 1 ✅',
									},
									{
										name: 'Tracker 2',
										value: 'tracker 2 ❌',
									},
									{
										name: 'Tracker 3',
										value: 'Checking your third tracker...',
									},
								]);

							await interaction.editReply({ content: '', embeds: [verifyEmbed] });

							return;
						}
					} else {
						const verifyEmbed = new EmbedBuilder()
							.setTitle('Account Verification')
							.setDescription('Verifying your Apex account. Please wait...')
							.addFields([
								{
									name: 'Legend',
									value: `${row[0]['legend']} ✅`,
								},
								{
									name: 'Tracker 1',
									value: 'trcker 1 ❌',
								},
								{
									name: 'Tracker 2',
									value: 'Checking your second tracker...',
								},
								{
									name: 'Tracker 3',
									value: 'Checking your third tracker...',
								},
							]);

						await interaction.editReply({ content: '', embeds: [verifyEmbed] });

						return;
					}
				} else {
					const verifyEmbed = new EmbedBuilder()
						.setTitle('Account Verification')
						.setDescription('Verifying your Apex account. Please wait...')
						.addFields([
							{
								name: 'Legend',
								value: `${row[0]['legend']} ❌ incorrect legend.`,
							},
							{
								name: 'Tracker 1',
								value: 'Checking your first tracker...',
							},
							{
								name: 'Tracker 2',
								value: 'Checking your second tracker...',
							},
							{
								name: 'Tracker 3',
								value: 'Checking your third tracker...',
							},
						]);

					await interaction.editReply({ content: '', embeds: [verifyEmbed] });

					return;
				}
			});
		});
	},
};
