const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Shows the bot\'s ping'),

    async execute(interaction, client) {
        // Send temporary reply
        await interaction.reply({
            content: '🏓 Pinging...',
            flags: 64,
            withResponse: true // ✅ updated from fetchReply
        });

        // Fetch the message to calculate API ping
        const message = await interaction.fetchReply();

        // Calculate pings
        let apiPing = message.createdTimestamp - interaction.createdTimestamp;
        apiPing = Math.max(apiPing, 0); // prevent negative numbers

        const wsPing = Math.max(Math.round(client.ws.ping), 0); // prevent negative

        // Build embed
        const embed = new EmbedBuilder()
            .setTitle(`${client.user.username} Ping`)
            .setDescription(`**WebSocket Ping:** ${wsPing}ms\n **API Ping:** ${apiPing}ms`)
            .setColor('#8A4FFF')
            .setFooter({
                text: interaction.guild ? interaction.guild.name : 'Server',
                iconURL: client.user.displayAvatarURL()
            });

        await interaction.editReply({ embeds: [embed], content: null });
    }
};
