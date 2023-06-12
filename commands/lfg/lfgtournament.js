const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

var bannedWords = require('../../data/bannedWords.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('lfg-tournament')
		.setDescription('Creates an LFG prompt for those participating in tournaments.')
		.addStringOption(option => option.setName('message').setDescription('This will be your lfg message').setRequired(true))
		.addStringOption(option =>
			option
				.setName('region')
				.setDescription('Your region')
				.setRequired(true)
				.addChoices(
					{ name: 'North America', value: 'North America' },
					{ name: 'Europe', value: 'Europe' },
					{ name: 'Oceania', value: 'Oceania' },
					{ name: 'Asia', value: 'Asia' },
					{ name: 'Latin America', value: 'Latin America' },
				),
		)
		.addStringOption(option =>
			option
				.setName('team-slots')
				.setDescription('Choose the number of teammates you need')
				.setRequired(true)
				.addChoices({ name: '1', value: '1' }, { name: '2', value: '2' }),
		)
		.addStringOption(option =>
			option
				.setName('highest-rank-in-apex')
				.setDescription('Select your rank')
				.setRequired(true)
				.addChoices(
					{ name: 'Apex Predator', value: 'Apex Predator' },
					{ name: 'Master', value: 'Master' },
					{ name: 'Diamond', value: 'Diamond' },
					{ name: 'Platinum', value: 'Platinum' },
					{ name: 'Gold', value: 'Gold' },
					{ name: 'Silver', value: 'Silver' },
					{ name: 'Bronze', value: 'Bronze' },
					{ name: 'Rookie', value: 'Rookie' },
				),
		)
		.addStringOption(option =>
			option
				.setName('minimum-rank-required')
				.setDescription('Select the preferred rank')
				.setRequired(true)
				.addChoices(
					{ name: 'Apex Predator', value: 'Apex Predator' },
					{ name: 'Master', value: 'Master' },
					{ name: 'Diamond', value: 'Diamond' },
					{ name: 'Platinum', value: 'Platinum' },
					{ name: 'Gold', value: 'Gold' },
					{ name: 'Silver', value: 'Silver' },
					{ name: 'Bronze', value: 'Bronze' },
					{ name: 'Rookie', value: 'Rookie' },
				),
		)
		.addStringOption(option => option.setName('self-mains').setDescription('Your main Legends').setRequired(true))
		.addStringOption(option => option.setName('preferred-team-mains').setDescription('Any preferred team main Legends').setRequired(true))
		.addStringOption(option =>
			option.setName('platform').setDescription('Your platform').setRequired(true).addChoices({ name: 'PC', value: 'PC' }, { name: 'Console', value: 'Console' }),
		)
		.addStringOption(option => option.setName('gamer-tag').setDescription('Your name in the game').setRequired(true))
		.addStringOption(option => option.setName('tournament-name').setDescription('Name of the tournament you are participating').setRequired(true))
		.addStringOption(option => option.setName('date-of-tournament').setDescription('Date of the tournament').setRequired(true)),
	async execute(interaction) {
		const { options } = interaction;

		const description = options.getString('message');
		const fieldr = options.getString('region');
		const fieldgts = options.getString('team-slots');
		const fieldhria = options.getString('highest-rank-in-apex');
		const fieldmrr = options.getString('minimum-rank-required');
		const fieldsm = options.getString('self-mains');
		const fieldptm = options.getString('preferred-team-mains');
		const fieldp = options.getString('platform');
		const fieldi = options.getString('gamer-tag');
		const fieldtn = options.getString('tournament-name');
		const fielddot = options.getString('date-of-tournament');

		if (bannedWords.some(i => description.toLowerCase().includes(i))) {
			console.log(interaction.member.displayName + ' tried to use a banned word in their LFG message.');

			await interaction.reply({
				content: 'Your LFG message contains a bad word!',
				ephemeral: true,
			});

			return;
		}

		if (fieldsm) {
			if (bannedWords.some(i => fieldsm.toLowerCase().includes(i))) {
				console.log(`${interaction.member.displayName} (${interaction.member.id}) tried to use a banned word in their LFG message.`);

				await interaction.reply({
					content: 'Your LFG message contains a bad word!',
					ephemeral: true,
				});

				return;
			}
		}

		if (fieldptm) {
			if (bannedWords.some(i => fieldptm.toLowerCase().includes(i))) {
				console.log(`${interaction.member.displayName} (${interaction.member.id}) tried to use a banned word in their LFG message.`);

				await interaction.reply({
					content: 'Your LFG message contains a bad word!',
					ephemeral: true,
				});

				return;
			}
		}

		if (fieldtn) {
			if (bannedWords.some(i => fieldtn.toLowerCase().includes(i))) {
				console.log(`${interaction.member.displayName} (${interaction.member.id}) tried to use a banned word in their LFG message.`);

				await interaction.reply({
					content: 'Your LFG message contains a bad word!',
					ephemeral: true,
				});

				return;
			}
		}

		const embed = new EmbedBuilder()
			.setAuthor({
				name: `${interaction.member.displayName} is looking for tournament teammates`,
				iconURL: interaction.member.displayAvatarURL({ dynamic: true }),
			})
			.setDescription(`<@${interaction.member.id}>'s message: ${description}`)
			.setThumbnail('attachment://trios.png')
			.setTimestamp()
			.addFields({ name: '__Region__', value: `${fieldr}`, inline: true })
			.addFields({
				name: '__Team Slots__',
				value: `${fieldgts}`,
				inline: true,
			})
			.addFields({
				name: '__Highest Rank in Apex__',
				value: `${fieldhria}`,
				inline: true,
			})
			.addFields({
				name: '__Minimum Rank Required__',
				value: `${fieldmrr}`,
				inline: true,
			})
			.addFields({
				name: '__Self Mains__',
				value: `${fieldsm}`,
				inline: true,
			})
			.addFields({
				name: '__Preferred Team Mains__',
				value: `${fieldptm}`,
				inline: true,
			})
			.addFields({
				name: '__Platform__',
				value: `${fieldp}`,
				inline: true,
			})
			.addFields({
				name: '__Gamer Tag__',
				value: `${fieldi}`,
				inline: true,
			})
			.addFields({
				name: '__Tournament Name__',
				value: `${fieldtn}`,
				inline: true,
			})
			.addFields({
				name: '__Date of Tournament__',
				value: `${fielddot}`,
				inline: true,
			})
			.setFooter({
				text: 'Read channel pins!',
				iconURL: 'attachment://pin.png',
			});

		await interaction.reply({
			content: 'Your LFG message has been sent below!',
			ephemeral: true,
		});

		await interaction.channel.send({
			embeds: [embed],
			files: [
				{
					attachment: `${__dirname}/../../images/nonRanked/Trios.png`,
					name: 'trios.png',
				},
				{
					attachment: `${__dirname}/../../images/other/pin.png`,
					name: 'pin.png',
				},
			],
		});
	},
};
