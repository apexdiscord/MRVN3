const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const Database = require('better-sqlite3');

// Create or open the SQLite database
const db3 = new Database(`${__dirname}/../../databases/savedlfg.sqlite`, { verbose: console.log });

module.exports = {
    data: new SlashCommandBuilder()
        .setName('recalllfg')
        .setDescription('Recalls and posts saved LFG data.'),
    async execute(interaction) {
        const { member, channel } = interaction;

        // Retrieve the saved LFG data for the member from the database
        const selectStmt = db3.prepare(`
            SELECT * FROM savedlfg WHERE user_id = ?
        `);
        const lfgData = selectStmt.get(member.id);

        if (!lfgData) {
            await interaction.reply({
                content: 'No saved LFG data found for you.',
                ephemeral: true,
            });
            return;
        }

        const {
            mode,
            description,
            playerno,
            fieldmic,
            fieldp,
            fieldm,
            fieldg
        } = lfgData;

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

if (mode == 'Duos' && interaction.member.voice.channel) {
    // set user limit of current voice channel to 2
    interaction.member.voice.channel.setUserLimit(2);
} else if (interaction.member.voice.channel) {
    // set user limit of current voice channel to 3
    interaction.member.voice.channel.setUserLimit(3);
}

let playersNeeded = !playerno ? `is looking for a team` : `is looking for ${playerno}`;

const embed = new EmbedBuilder()
    .setAuthor({
        name: `${interaction.member.displayName} ${playersNeeded}`,
        iconURL: interaction.member.displayAvatarURL({ dynamic: true }),
    })
    .setDescription(`<@${interaction.member.id}>'s message: ${description}`)
    .setThumbnail(`attachment://${mode}.png`)
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

if (interaction.member.voice.channel || row.components.length != 0) {
    await interaction.channel.send({
        embeds: [embed],
        components: [row],
        files: [
            {
                attachment: `${__dirname}/../../images/nonRanked/${mode}.png`,
                name: `${mode}.png`,
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
                attachment: `${__dirname}/../../images/nonRanked/${mode}.png`,
                name: `${mode}.png`,
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
