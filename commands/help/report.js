const { SlashCommandBuilder, EmbedBuilder, Collection } = require('discord.js');
const { owners } = require('../../config.json'); // Array of bot owner IDs

// Ensure cooldown collection exists
// This should ideally be in your main file once, but safe to initialize here if missing
module.exports.cooldowns = new Collection();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('report')
        .setDescription('Report an issue to the bot owners')
        .addStringOption(option =>
            option.setName('message')
                .setDescription('Describe your report')
                .setRequired(true)
        ),

    cooldown: 3600, // 1 hour in seconds

    async execute(interaction, client) {
        // Initialize cooldown map for this command
        if (!client.cooldowns.has('report')) {
            client.cooldowns.set('report', new Collection());
        }
        const timestamps = client.cooldowns.get('report');
        const now = Date.now();
        const cooldownAmount = (3600 * 1000); // 1 hour

        if (timestamps.has(interaction.user.id)) {
            const expiration = timestamps.get(interaction.user.id) + cooldownAmount;
            if (now < expiration) {
                const timeLeft = Math.ceil((expiration - now) / 1000 / 60); // minutes
                return interaction.reply({
                    content: `⏳ You can only send one report per hour. Please wait ${timeLeft} more minute(s).`,
                    flags: 64
                });
            }
        }

        // Set cooldown
        timestamps.set(interaction.user.id, now);
        setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);

        const reportMessage = interaction.options.getString('message');

        // Acknowledge the user
        await interaction.reply({
            content: '✅ Your report has been sent to the bot owners. Thank you!',
            flags: 64,
            withResponse: true
        });

        // Split long reports into multiple embeds if needed
        const chunkSize = 1024;
        const chunks = [];
        for (let i = 0; i < reportMessage.length; i += chunkSize) {
            chunks.push(reportMessage.slice(i, i + chunkSize));
        }

        // Build embeds
        const embeds = chunks.map((chunk, index) =>
            new EmbedBuilder()
                .setTitle(`New Report from ${interaction.user.tag}`)
                .setColor('#FF0000')
                .setDescription(`||${chunk}||`) // hidden content in spoiler tags
                .setFooter({
                    text: `Page ${index + 1}/${chunks.length} | User ID: ${interaction.user.id}`,
                    iconURL: interaction.user.displayAvatarURL()
                })
                .setTimestamp()
        );

        // Send to all owners
        for (const ownerId of owners) {
            const owner = await client.users.fetch(ownerId).catch(() => null);
            if (!owner) continue;

            for (const embed of embeds) {
                await owner.send({ embeds: [embed] }).catch(() => null);
            }
        }
    }
};
