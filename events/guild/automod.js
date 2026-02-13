const { owners, adminRoles, modRoles } = require('../../config.json');

// Track user messages for rate-limit spam
const userMessageTimestamps = new Map();

module.exports = {
    name: 'messageCreate',
    async execute(message, client) {
        if (message.author.bot) return;

        const member = message.member;

        // ---------- BYPASS ----------
        if (owners.includes(message.author.id)) return;
        if (adminRoles.some(r => member.roles.cache.has(r))) return;
        if (modRoles.some(r => member.roles.cache.has(r))) return;

        // ---------- IGNORE EMPTY MESSAGES ----------
        if (!message.content && message.attachments.size === 0) return;

        const content = message.content.toLowerCase();

        // ---------- AUTOMOD RULES ----------

        const inviteRegex = /(discord\.gg|discordapp\.com\/invite)/i;
        const pornRegex = /(pornhub\.com|xvideos\.com|xnxx\.com|redtube\.com|tube8\.com|youporn\.com)/i;
        const ghostPing = message.mentions.members.size > 0 && !content.replace(/\s/g, '');
        const emojiRegex = /<a?:\w+:\d+>|[\u{1F300}-\u{1FAFF}]/gu;
        const emojiMatches = (message.content.match(emojiRegex) || []).length;
        const imageSpam = message.attachments.size > 3;
        const pingSpam = message.mentions.members.size > 5;

        // Rate-limit spam: 5 messages in 10s
        const now = Date.now();
        const timestamps = userMessageTimestamps.get(message.author.id) || [];
        const filtered = timestamps.filter(t => now - t < 10000);
        filtered.push(now);
        userMessageTimestamps.set(message.author.id, filtered);
        const rateSpam = filtered.length > 5;

        // ---------- DELETE MESSAGE IF ANY RULE TRIGGERED ----------
        if (inviteRegex.test(content) || pornRegex.test(content) || ghostPing || emojiMatches > 10 || imageSpam || pingSpam || rateSpam) {
            try {
                await message.delete().catch(() => null);

                // DM the user showing what was removed (in spoiler)
                try {
                    const messageContent = message.content || '[Attachment / Embed only]';
                    await message.author.send(
                        `Your message in **${message.guild.name}** was removed due to AutoMod rules.\n` +
                        `Content: ||${messageContent}||`
                    ).catch(() => null);
                } catch {}
            } catch (err) {
                console.error(`Failed to delete message for ${message.author.tag}:`, err);
            }
        }

        // ---------- CLEANUP ----------
        setTimeout(() => {
            const timestamps = userMessageTimestamps.get(message.author.id) || [];
            const updated = timestamps.filter(t => now - t < 10000);
            if (updated.length === 0) userMessageTimestamps.delete(message.author.id);
            else userMessageTimestamps.set(message.author.id, updated);
        }, 10000);
    }
};
