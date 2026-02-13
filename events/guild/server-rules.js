const { EmbedBuilder, TextChannel, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { guildId, rulesChannelId } = require('../../config.json');

// Suppress clientReady deprecation warning
process.removeAllListeners('warning');
process.on('warning', (warning) => {
    if (warning.name === 'DeprecationWarning' && warning.message.includes('clientReady')) return;
    console.warn(warning);
});

module.exports = {
    name: 'ready',
    once: true,
    async execute(client) {
        try {
            const guild = client.guilds.cache.get(guildId);
            if (!guild) return;

            const channel = guild.channels.cache.get(rulesChannelId);
            if (!channel || !(channel instanceof TextChannel)) return;

            // Fetch the /report command ID dynamically
            let reportCommandId = null;
            try {
                const commands = await client.application.commands.fetch({ guildId });
                const reportCmd = commands.find(cmd => cmd.name === 'report');
                if (reportCmd) reportCommandId = reportCmd.id;
            } catch {
                // silently fail if unable to fetch command ID
            }

            // Build rules embed
            const embed = new EmbedBuilder()
                .setTitle('SERVER RULES — READ CAREFULLY')
                .setColor('#8A4FFF')
                .setThumbnail(client.user.displayAvatarURL())
                .setFooter({
                    text: guild.name,
                    iconURL: client.user.displayAvatarURL()
                })
                .setDescription('Welcome to the server! Please read these rules carefully to ensure a fun and safe environment.')
                .addFields(
                    { name: '1. Be Respectful', value: 'Treat everyone with respect. Harassment, discrimination, or targeted hostility is not tolerated.' },
                    { name: '2. Keep Language Appropriate', value: `Avoid excessive inappropriate language. If someone is bothering you, use ${reportCommandId ? `</report:${reportCommandId}>` : '/report'} instead of escalating.` },
                    { name: '3. No Spamming', value: 'Do not flood chat with repeated messages, emojis, pings, or unnecessary noise.' },
                    { name: '4. No NSFW Content', value: 'Pornographic, sexual, graphic, gory, or otherwise NSFW content is strictly prohibited.' },
                    { name: '5. No Advertising', value: 'Advertising other servers, products, streams, or services is not allowed.' },
                    { name: '6. No Offensive Names or Profile Pictures', value: 'Staff may request you to change your name or avatar if deemed inappropriate.' },
                    { name: '7. No Raiding', value: 'Raiding, coordinating raids, or encouraging raids will result in an immediate ban.' },
                    { name: '8. No Threats', value: 'Direct or indirect threats (DDoS, doxxing, harm, abuse, etc.) are strictly forbidden.' },
                    { name: '9. No Begging', value: 'Do not beg for roles, permissions, gifts, subscriptions, or anything similar. (Bots cannot gift anything.)' },
                    { name: '10. No Buying/Selling', value: 'Discussions about buying, selling, or trading accounts/products are not allowed. Reminder: Buying/selling Fortnite accounts and some Epic products is federally illegal.' },
                    { name: '11. No Arguing or Excessive Trolling', value: 'Keep conversations civil. Do not intentionally provoke or derail discussions.' },
                    { name: '12. No Spreading False Information', value: 'Do not share misleading, fabricated, or unverified information.' },
                    { name: '13. Do Not Bypass Auto‑Mod', value: 'Attempting to bypass filters or restrictions will result in punishment.' },
                    { name: '14. Follow Discord’s Terms of Service', value: 'Use the buttons below to view Discord’s official rules.' },
                    { name: 'Notes', value: `Staff may mute, kick, or ban at their discretion. Use ${reportCommandId ? `</report:${reportCommandId}>` : '/report'} if needed.\nAuto‑mod is active; deleted messages may be due to filters.\nRules may change at any time.\nIf unsure, ask in <#1471948938624893089>.` }
                );

            // Buttons for Terms and Guidelines
            const buttons = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setLabel('Discord Terms of Service')
                    .setStyle(ButtonStyle.Link)
                    .setURL('https://discord.com/terms'),
                new ButtonBuilder()
                    .setLabel('Discord Community Guidelines')
                    .setStyle(ButtonStyle.Link)
                    .setURL('https://discord.com/guidelines')
            );

            // Check for existing embed
            const messages = await channel.messages.fetch({ limit: 50 });
            const existingEmbed = messages.find(
                m => m.author.id === client.user.id && m.embeds.length && m.embeds[0].title?.includes('SERVER RULES')
            );

            if (existingEmbed) {
                await existingEmbed.edit({ embeds: [embed], components: [buttons] });
            } else {
                await channel.send({ embeds: [embed], components: [buttons] });
            }

        } catch (err) {
            console.error('Failed to send or update rules embed:', err);
        }
    }
};
