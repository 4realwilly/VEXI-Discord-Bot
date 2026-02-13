const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('uptime')
        .setDescription('Shows the bot\'s uptime'),

    async execute(interaction, client) {
        let totalSeconds = Math.floor(client.uptime / 1000);

        const days = Math.floor(totalSeconds / 86400);
        totalSeconds %= 86400;

        const hours = Math.floor(totalSeconds / 3600);
        totalSeconds %= 3600;

        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;

        // Build human-readable string
        const uptimeString = [
            days ? `${days}d` : null,
            hours ? `${hours}h` : null,
            minutes ? `${minutes}m` : null,
            seconds ? `${seconds}s` : null
        ].filter(Boolean).join(', ');

        const embed = new EmbedBuilder()
            .setTitle(`${client.user.username} Uptime`)
            .setDescription(`I have been online for **${uptimeString}**`)
            .setColor('#8A4FFF')
            .setFooter({
                text: interaction.guild ? interaction.guild.name : 'VEXI - BOT LOBBIES',
                iconURL: client.user.displayAvatarURL()
            });

        await interaction.reply({
            embeds: [embed],
            flags: 64 // ephemeral
        });
    }
};
