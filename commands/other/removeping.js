const { SlashCommandBuilder } = require('discord.js');
const Database = require('better-sqlite3');

const db_roleTracker = new Database(`${__dirname}/../../databases/roleTracker.sqlite`);

// Array of ping role IDs because other roles should not be removed
const botAddedRoleIDs = [
  '1125310238514483230',
  'placeholderid1',
  'placeholderid2',
  'placeholderid3',
  'placeholderid4',
  'placeholderid5',
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ping-role-remove')
    .setDescription('Remove the ranked ping roles added by the bot.'),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const member = interaction.member;
    const userID = interaction.user.id;

    try {
      // Filter the member's roles to include only the bot-added roles
      const rolesToRemove = member.roles.cache.filter(role => botAddedRoleIDs.includes(role.id)).map(role => role.id);

      // Remove the bot-added roles
      if (rolesToRemove.length > 0) {
        await member.roles.remove(rolesToRemove);

        // Delete role data from the database
        db_roleTracker.prepare(`DELETE FROM roleExpiryTracker WHERE userID = ? AND roleToAdd IN (${rolesToRemove.map(_ => '?').join(', ')})`)
          .run(userID, ...rolesToRemove);

        await interaction.editReply({
          content: 'Successfully removed the ranked ping role(s) added by the bot.',
          ephemeral: true,
        });
      } else {
        await interaction.editReply({
          content: 'You currently do not have any ranked ping role(s) added by the bot.',
          ephemeral: true,
        });
      }
    } catch (error) {
      console.error(error);
      await interaction.editReply({
        content: 'There was an error while executing this command!',
        ephemeral: true,
      });
    }
  },
};
