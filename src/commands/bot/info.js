const { DateTime } = require('luxon');
const { uptimeText } = require('../../utilities/misc.js');
const { MessageFlags, SectionBuilder, ContainerBuilder, ThumbnailBuilder, TextDisplayBuilder, SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder().setName('info').setDescription('Show info about the bot.'),

	async execute(interaction) {
		const lastDate = DateTime.fromISO('2014-03-18T00:00:00.000Z');

		const daysSinceLastDirective = Math.floor(DateTime.now().diff(lastDate, 'days').days);

		const infoContainer = new ContainerBuilder()
			.addSectionComponents(
				new SectionBuilder()
					.setThumbnailAccessory(new ThumbnailBuilder().setURL(interaction.client.user.displayAvatarURL()))
					.addTextDisplayComponents(
						new TextDisplayBuilder().setContent(`# MRVN LFG\n-# **LFG Manager for [Apex Legends](https://discord.gg/ApexLegends)**\n-# ${daysSinceLastDirective} Days Since Last Directive`),
					),
			)
			.addTextDisplayComponents(new TextDisplayBuilder().setContent('## Links\n[GitHub](https://github.com/apexdiscord/MRVN3)'))
			.addTextDisplayComponents(new TextDisplayBuilder().setContent(`## Uptime\n${uptimeText()}`));

		await interaction.deleteReply();
		await interaction.channel.send({ components: [infoContainer], flags: MessageFlags.IsComponentsV2 });
	},
};
