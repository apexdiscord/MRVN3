const moment = require('moment');
const Database = require('better-sqlite3');
const { SlashCommandBuilder } = require('discord.js');

const db_roleTracker = new Database(`${__dirname}/../../databases/roleTracker.sqlite`);

module.exports = {
	data: new SlashCommandBuilder()
		.setName('add-ping-role')
		.setDescription('Add a ranked ping role to get notified when someone posts looking for that rank.')
		.addStringOption(option =>
			option.setName('rank').setDescription('Choose the rank you want to be pinged for.').setRequired(true).addChoices(
					{ name: 'Rookie', value: '1125310238514483230' },
					{ name: 'Bronze', value: 'roleIDplaceholder' },
					{ name: 'Silver', value: 'roleIDplaceholder' },
					{ name: 'Gold', value: 'roleIDplaceholder' },
					{ name: 'Platinum', value: 'roleIDplaceholder' },
					{ name: 'Diamond', value: 'roleIDplaceholder' },
					{ name: 'Master', value: 'roleIDplaceholder' },
					{ name: 'Apex Predator', value: 'roleIDplaceholder' },
				),
		)
		.addStringOption(option =>
			option.setName('time').setDescription('How long do you want the role for?').setRequired(true).addChoices(
				{
					name: '20 minutes',
					value: '1200',
				},
				{
					name: '1 hour',
					value: '3600',
				},
				{
					name: 'Permanent',
					value: 'Permanent',
				},
			),
		),

	async execute(interaction) {
		await interaction.deferReply({ ephemeral: true });

		const roleToAdd = interaction.options.getString('rank');

		const selectedTime = parseInt(interaction.options.getString('time'));

		const userID = interaction.user.id;

		try {
			const timestamp = moment().unix();
			
			if (typeof selectedTime === 'number') {
				const expiryTime = timestamp + selectedTime
				db_roleTracker.prepare(`INSERT OR REPLACE INTO roleExpiryTracker (expiryTime, roleToAdd, userID) VALUES (?, ?, ?)`).run(expiryTime, roleToAdd, userID);
				interaction.member.roles.add(roleToAdd);

			} else if (!isNaN(selectedTime)) {
				interaction.member.roles.add(roleToAdd);
				  }
			
			else {
				message.channel.send('An error occurred while adding the role.');
				  }

			await interaction.editReply({
				content: `Successfully added the role <@&${roleToAdd}> on you for the selected time period!`,
				ephemeral: true,
			});
		} catch (error) {
			console.log(error);
			await interaction.editReply({ content: 'There was an error while executing this command!', ephemeral: true });
		}
	},
};
