const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('lfg-tournament')
    .setDescription('This creates a LFG embed')
    .addStringOption(option => option.setName('message').setDescription('This will be your lfg message').setRequired(true))
    .addStringOption(option => option.setName("region").setDescription('Your region').setRequired(true).addChoices(
        { name: 'North America', value: 'North America' },
        { name: 'Europe', value: 'Europe' },
        { name: 'Oceania', value: 'Oceania' },
        { name: 'Asia', value: 'Asia' },
        { name: 'Latin America', value: 'Latin America' },
    ))
    .addStringOption(option => option.setName("team-slots").setDescription('Choose the number of teammates you need').setRequired(true).addChoices(
        { name: '1', value: '1' },
        { name: '2', value: '2' },
    ))
    .addStringOption(option => option.setName("highest-rank-in-apex").setDescription('Select your rank').setRequired(true).addChoices(
        { name: 'Predator', value: 'Worlds Edge' },
        { name: 'Master', value: 'Storm Point' },
        { name: 'Diamond', value: 'Broken Moon' },
        { name: 'Platinum', value: 'Aggressive' },
        { name: 'Gold', value: 'Olympus' },
        { name: 'Silver', value: 'Skull Town' },
        { name: 'Bronze', value: 'Overflow' },
        { name: 'Rookie', value: 'Habitat 4' },
    ))
    .addStringOption(option => option.setName("minimum-rank-required").setDescription('Select the preferred rank').setRequired(true).addChoices(
        { name: 'Predator', value: 'Worlds Edge' },
        { name: 'Master', value: 'Storm Point' },
        { name: 'Diamond', value: 'Broken Moon' },
        { name: 'Platinum', value: 'Aggressive' },
        { name: 'Gold', value: 'Olympus' },
        { name: 'Silver', value: 'Skull Town' },
        { name: 'Bronze', value: 'Overflow' },
        { name: 'Rookie', value: 'Habitat 4' },
    ))
    .addStringOption(option => option.setName('self-mains').setDescription('Your main Legends').setRequired(true))
    .addStringOption(option => option.setName('preferred-team-mains').setDescription('Any preferred team main Legends').setRequired(true))
    .addStringOption(option => option.setName("platform").setDescription('Your platform').setRequired(true).addChoices(
        { name: 'PC', value: 'PC' },
        { name: 'Console', value: 'Console' },
    ))
    .addStringOption(option => option.setName('gamer-tag').setDescription('Your name in the game').setRequired(true))
    .addStringOption(option => option.setName('tournament-name').setDescription('Name of the tournament you are participating').setRequired(true))
    .addStringOption(option => option.setName('date-of-tournament').setDescription('Date of the tournament').setRequired(true)),
    async execute (interaction)  {

        const {options} = interaction;

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

        const embed = new EmbedBuilder()
        .setAuthor({name: `${interaction.member.displayName} is looking for tournament teammates`, iconURL: interaction.member.displayAvatarURL({dynamic: true})})
        .setDescription(`<@${interaction.member.id}>'s message: ${description}`)
        .setThumbnail('https://cdn.discordapp.com/attachments/1102189428966965299/1102239138507407582/trios.png')
        .setTimestamp()
        .addFields({name: '__Region__', value: `${fieldr}`, inline: true})
        .addFields({name: '__Team Slots__', value: `${fieldgts}`, inline: true})
        .addFields({name: '__Highest Rank in Apex__', value: `${fieldhria}`, inline: true})
        .addFields({name: '__Minimum Rank Required__', value: `${fieldmrr}`, inline: true})
        .addFields({name: '__Self Mains__', value: `${fieldsm}`, inline: true})
        .addFields({name: '__Preferred Team Mains__', value: `${fieldptm}`, inline: true})
        .addFields({name: '__Platform__', value: `${fieldp}`, inline: true})
        .addFields({name: '__Gamer Tag__', value: `${fieldi}`, inline: true})
        .addFields({name: '__Tournament Name__', value: `${fieldtn}`, inline: true})
        .addFields({name: '__Date of Tournament__', value: `${fielddot}`, inline: true})
        .setFooter({text: `Read channel pins!`, iconURL: 'https://cdn.discordapp.com/attachments/1102189428966965299/1103018038896382012/09204f6a96455580e749454b7449aa82.png'})

        await interaction.reply({content: "Your LFG message has been sent below!", ephemeral: true});

        await interaction.channel.send({embeds: [embed]});

    }
}