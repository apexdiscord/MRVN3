module.exports = {
    data: {
      name: 'ping',
      description: 'Ping command to test bot response.',
    },
    async execute(interaction) {
      await interaction.reply('Pong!');
    },
  };
  