const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kick')
        .setDescription('Removes a member from their current voice channel.')
        .addUserOption(option =>
            option.setName('member-name')
            .setDescription('The member to be removed from their voice channel.')
            .setRequired(true)),
    async execute(interaction) {
        const user = interaction.options.getUser('member-name');
        const member = interaction.guild.members.cache.get(user.id);
        const invokerMember = interaction.guild.members.cache.get(interaction.user.id);
        if (!member.voice.channel) {
            await interaction.reply({ content: 'This member is not connected to a voice channel.', ephemeral: true });
            return;
        }
        if (!invokerMember.voice.channel || invokerMember.voice.channel.id !== member.voice.channel.id) {
            await interaction.reply({ content: 'You must be in the same voice channel as the member you want to remove.', ephemeral: true });
            return;
        }
        try {
            await member.voice.disconnect();
            await interaction.reply({ content: `Successfully removed ${user.username} from their voice channel.`, ephemeral: true });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
        }
    },
};
