const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('uptime')
        .setDescription('Shows the bot\'s uptime'),

    async execute(interaction, client) {
        // Bot uptime in seconds
        const uptimeSeconds = Math.floor(client.uptime / 1000);

        // Convert to Discord timestamp (relative)
        const timestamp = Math.floor(Date.now() / 1000) - uptimeSeconds;

        const embed = new EmbedBuilder()
            .setTitle(`${client.user.username} Uptime`)
            .setDescription(`I have been online for <t:${timestamp}:R>`)
            .setColor('#8A4FFF')
            .setFooter({
                text: interaction.guild ? interaction.guild.name : 'Server',
                iconURL: client.user.displayAvatarURL()
            });

        await interaction.reply({
            embeds: [embed],
            flags: 64 // ephemeral
        });
    }
};
