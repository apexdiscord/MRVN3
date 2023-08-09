const axios = require('axios');
const db = require('../../utilities/database.js');
const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');

const { embedColor, Misc } = require('../../data/utilities.json');
const { getStatus, rankLayout, platformName, platformEmote } = require('../../utilities/stats.js');

const oldTrackers = playerData.active.trackers

async function monitorChanges(playerID, oldTrackers) {
    const startTime = Date.now();
    const endTime = startTime + 15 * 60 * 1000; // 15 min
    
    while (Date.now() < endTime) {
        const response = await axios.get(`https://api.jumpmaster.xyz/user/Profile/${playerID}`);
        const newTrackers = response.data.user.trackers;
        if (newTrackers == oldTrackers) {

			return true;

        }
        
        await new Promise(resolve => setTimeout(resolve, 60000)); // 1 min
    }
    
    return false;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('link')
        .setDescription('Link an existing Apex account to your Discord account.')
        .addStringOption(option =>
            option.setName('platform').setDescription('The platform you play on').setRequired(true).addChoices(
                {
                    name: 'PC (Steam/Origin)',
                    value: 'PC',
                },
                {
                    name: 'PlayStation',
                    value: 'PS4',
                },
                {
                    name: 'Xbox',
                    value: 'X1',
                },
            ),
        )
        .addStringOption(option => option.setName('username').setDescription("Your in-game username. If this doesn't work, try a previous username").setRequired(true)),

    async execute(interaction) {

        const platform = interaction.options.getString('platform');
        const username = interaction.options.getString('username');

        const loadingEmbed = new EmbedBuilder().setDescription(`${Misc.Loading} Loading data for selected account...`).setColor(embedColor);

        await interaction.editReply({ embeds: [loadingEmbed] });

        try {
            const response = await axios.get(`https://api.jumpmaster.xyz/user/Stats?platform=${platform}&player=${encodeURIComponent(username)}&key=${process.env.SPYGLASS}`);
            const data = response.data;

            const playerID = data.user.id;
            const discordID = interaction.user.id;

            let linkQuery = 'SELECT * FROM specter WHERE discordID = ?';

            db.query(linkQuery, [discordID], async (err, row) => {
                if (err) {
                    console.log(err);
                    return interaction.editReply({ content: 'There was a database error.', embeds: [] });
                }

                if (row.length === 0) {

                    // Three functions to get 3 random numbers assigned to the trackers
					while(Tracker1 != Tracker2 != Tracker3) {
					function getRandomIntInclusive0(min, max) {
						min = Math.ceil(min);
						max = Math.floor(max);
						return Math.floor(Math.random() * (max - min + 1) + min); // The maximum is inclusive and the minimum is inclusive
					  }

					function getRandomIntInclusive1(min, max) {
						min = Math.ceil(min);
						max = Math.floor(max);
						return Math.floor(Math.random() * (max - min + 1) + min); // The maximum is inclusive and the minimum is inclusive
					  }
					  
					function getRandomIntInclusive2(min, max) {
						min = Math.ceil(min);
						max = Math.floor(max);
						return Math.floor(Math.random() * (max - min + 1) + min); // The maximum is inclusive and the minimum is inclusive
					  }
					} 
					while (oldTrackers != randomTrackers) {
                    const randomTrackers = ['Tracker1', 'Tracker2', 'Tracker3']; 

					const oldTrackers = playerData.active.trackers

					let storeOldTrackers = 'SELECT * FROM specter WHERE oldTrackers = ?';

            		db.query(storeOldTrackers, [oldTrackers], async (err, row) => {
                		if (err) {
                    		console.log(err);
                    		return interaction.editReply({ content: 'There was a database error.', embeds: [] });
                		}
					})
                    // Send the user a list of random badges and trackers
                    const verificationEmbed = new EmbedBuilder()
                        .setDescription(`Please equip the following badges or trackers on your active legend:\nTrackers: ${randomTrackers.join(', ')}`)
                        .setColor(embedColor);

                    await interaction.editReply({ embeds: [verificationEmbed] });

                    // Monitor changes for verification
                    const verificationSuccess = await monitorChanges(playerID, (badges, trackers) => {
                        // Check if the user's active legend has the required badges and trackers
                        const hasRequiredBadges = randomBadges.every(badge => badges.includes(badge));
                        const hasRequiredTrackers = randomTrackers.every(tracker => trackers.includes(tracker));
                        
                        return hasRequiredBadges && hasRequiredTrackers;
                    });

                    if (verificationSuccess) {
                        let insertUserLink = `INSERT INTO specter (discordID, playerID, platform) VALUES(?, ?, ?)`;

                        db.query(insertUserLink, [discordID, playerID, platform], (err, row) => {
                            if (err) return console.log(err);
                        });

                        return interaction.editReply({
                            content: `Linked player \`${data.user.username}\` to discord account \`${interaction.user.tag}\`. Use \`/me\` to view your linked account.`,
                            embeds: [],
                        });
                    } else {
                        return interaction.editReply({
                            content: 'Account verification failed. Please make sure you have equipped the required badges and trackers and run the command again.',
                            embeds: [],
                        });
                    }
                } else {
                    return interaction.editReply({
                        content: 'You already have a linked account. Use `/me` to see your linked account or `/unlink` to unlink your account.',
                        embeds: [],
                    });
                }
            });
        } catch (error) {
            // Handle errors
            if (error.response) {
                console.log(error.response.data);

                const errorEmbed = new EmbedBuilder()
                    .setTitle('Player Lookup Error')
                    .setDescription(`There was an error finding your account, linking to your discord account has been canceled.\n\n${error.response.data.error}`)
                    .setColor('D0342C')
                    .setTimestamp();

                interaction.editReply({ embeds: [errorEmbed] });
            } else if (error.request) {
                console.log(error.request);

                const errorEmbed = new EmbedBuilder()
                    .setTitle('Site Lookup Error')
                    .setDescription(
                        `There was an error finding your account, linking to your discord account has been canceled.\n\nThe request was not returned successfully.\nThis is potentially an error with the API.\nPlease try again shortly.`,
                    )
                    .setColor('D0342C')
                    .setTimestamp();

                interaction.editReply({ embeds: [errorEmbed] });
            } else {
                console.log(error.message);

                const errorEmbed = new EmbedBuilder()
                    .setTitle('Unknown Error')
                    .setDescription(`This should never happen.\nIf you see this error, please contact <@360564818123554836> ASAP.`)
                    .setColor('D0342C');

                interaction.editReply({ embeds: [errorEmbed] });
            }
        }
    },
};
