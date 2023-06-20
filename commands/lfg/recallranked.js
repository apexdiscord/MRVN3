const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const Database = require('better-sqlite3');

// Create or open the SQLite database
const db3 = new Database(`${__dirname}/../../databases/savedlfg.sqlite`, { verbose: console.log });

module.exports = {
	data: new SlashCommandBuilder().setName('rr').setDescription('Recalls your saved LFG and posts it.'),
	async execute(interaction) {
		await interaction.deferReply({ ephemeral: true });

		const { member, channel } = interaction;

		if (
			interaction.member.voice.channel &&
			(interaction.member.voice.channel.parentId == process.env.GEN_CATEGORY || interaction.member.voice.channel.parentId == process.env.EVENT_CATEGORY)
		) {
			await interaction.editReply({
				content: `You cannot use this command while in <#${interaction.member.voice.channel.id}>. Please disconnect or move to an LFG voice channel.`,
				ephemeral: true,
			});

			return;
		}

		// Retrieve the saved LFG data for the member from the database
		const selectStmt = db3.prepare(`
            SELECT * FROM savedLFGranked WHERE user_id = ?
        `);
		const lfgData = selectStmt.get(member.id);

		if (!lfgData) {
			await interaction.editReply({
				content: 'No saved LFG data found for you.',
				ephemeral: true,
			});
			return;
		} else {
			await interaction.editReply({
				content: 'Posted your saved LFG data below.',
				ephemeral: true,
			});
		}

		const { description, playerno, fieldmic, fieldp, fieldm, fieldg, selectedrank } = lfgData;

		if (interaction.member.voice.channel) {
			var vclink = new ButtonBuilder()
				.setLabel('Join Voice')
				.setStyle(ButtonStyle.Link)
				.setEmoji('🔊')
				.setURL('https://discord.com/channels/' + `${interaction.guild.id}` + '/' + `${interaction.member.voice.channel.id}`);
		} else {
			var vclink = null;
		}

		const micyes = new ButtonBuilder().setCustomId('micyes').setLabel('Mic Required').setStyle(ButtonStyle.Danger).setDisabled(true);

		const micno = new ButtonBuilder().setCustomId('micno').setLabel('Mic Optional').setStyle(ButtonStyle.Success).setDisabled(true);

		const row = new ActionRowBuilder();
		if (interaction.member.voice.channel) row.addComponents(vclink);
		if (fieldmic == 'Yes') row.addComponents(micyes);
		if (fieldmic == 'No') row.addComponents(micno);

		let playersNeeded = !playerno ? `is looking for a team` : `is looking for ${playerno}`;

		const embed = new EmbedBuilder()
			.setAuthor({
				name: `${interaction.member.displayName} ${playersNeeded}`,
				iconURL: interaction.member.displayAvatarURL({ dynamic: true }),
			})
			.setDescription(`<@${interaction.member.id}>'s message: ${description}`)
			.setTimestamp()
			.setFooter({
				text: 'Read channel pins!',
				iconURL: 'attachment://pin.png',
			});
		if (fieldp)
			embed.addFields({
				name: '__Play Style__',
				value: `${fieldp}`,
				inline: true,
			});
		if (fieldm)
			embed.addFields({
				name: '__Main Legends__',
				value: `${fieldm}`,
				inline: true,
			});
		if (fieldg)
			embed.addFields({
				name: '__Gamer Tag__',
				value: `${fieldg}`,
				inline: true,
			});
		embed.setThumbnail(`attachment://Ranked_${selectedrank}.png`);

			if (interaction.member.voice.channel || row.components.length != 0) {
				await interaction.channel.send({
					embeds: [embed],
					components: [row],
					files: [
						{
							attachment: `${__dirname}/../../images/ranked/Ranked_${selectedrank}.png`,
							name: `Ranked_${selectedrank}.png`,
						},
						{
							attachment: `${__dirname}/../../images/other/pin.png`,
							name: 'pin.png',
						},
					],
				});
			} else {
				await interaction.channel.send({
					embeds: [embed],
					files: [
						{
							attachment: `${__dirname}/../../images/ranked/Ranked_${selectedrank}.png`,
							name: `Ranked_${selectedrank}.png`,
						},
						{
							attachment: `${__dirname}/../../images/other/pin.png`,
							name: 'pin.png',
						},
					],
				});
			}
		},
	};
	