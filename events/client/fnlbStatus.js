const { ChannelType } = require('discord.js');
const config = require('../../config.json');
const fetch = require('node-fetch');

module.exports = {
    name: 'clientReady',
    once: false,
    async execute(client) {
        let failureCount = 0;
        let intervalTime = 60000; // 1 minute
        let interval;

        const getLoadEmoji = (available, busy) => {
            const total = available + busy;
            if (total === 0) return '🔴';
            const load = busy / total;
            if (load < 0.5) return '🟢';
            if (load < 0.85) return '🟡';
            return '🔴';
        };

        const updateChannel = async (guild, id, newName) => {
            const channel = guild.channels.cache.get(id);
            if (!channel || channel.type !== ChannelType.GuildVoice) return;
            if (channel.name !== newName) await channel.setName(newName).catch(() => {});
        };

        const setMaintenance = async (guild) => {
            await updateChannel(guild, config.publicVcId, '┊Public: 🛠 Maintenance');
            await updateChannel(guild, config.premiumVcId, '┊Premium: 🛠 Maintenance');
            await updateChannel(guild, config.launchVcId, '┊Launch: 0');
        };

        const updateStatus = async () => {
            const guild = client.guilds.cache.get(config.guildId);
            if (!guild) return;

            try {
                // Fetch all bots
                const botsRes = await fetch('https://api.fnlb.net/bots', {
                    headers: {
                        'Authorization': `Bearer ${config.fnlbApiKey}`,
                        'Content-Type': 'application/json'
                    }
                });
                if (!botsRes.ok) throw new Error('Failed to fetch bots');
                const bots = await botsRes.json();

                // Fetch categories to determine VIP vs public
                const categoriesRes = await fetch('https://api.fnlb.net/categories', {
                    headers: {
                        'Authorization': `Bearer ${config.fnlbApiKey}`,
                        'Content-Type': 'application/json'
                    }
                });
                if (!categoriesRes.ok) throw new Error('Failed to fetch categories');
                const categories = await categoriesRes.json();

                // Separate VIP (premium) and public bots by category ID
                const vipCategoryIds = categories
                    .filter(cat => cat.name.toLowerCase().includes('vip') || cat.name.toLowerCase().includes('premium'))
                    .map(cat => cat.id);

                const publicBots = bots.filter(bot => !vipCategoryIds.includes(bot.parent));
                const vipBots = bots.filter(bot => vipCategoryIds.includes(bot.parent));

                const pubAvailable = publicBots.length;
                const vipAvailable = vipBots.length;

                // Use simple online/offline emoji (no detailed busy/connected data from /bots)
                const pubEmoji = pubAvailable > 0 ? '🟢' : '🔴';
                const vipEmoji = vipAvailable > 0 ? '🟢' : '🔴';

                await updateChannel(
                    guild,
                    config.publicVcId,
                    `┊Public: ${pubEmoji} Online (${pubAvailable})`
                );

                await updateChannel(
                    guild,
                    config.premiumVcId,
                    `┊Premium: ${vipEmoji} Online (${vipAvailable})`
                );

                await updateChannel(
                    guild,
                    config.launchVcId,
                    `┊Launch: ${pubAvailable + vipAvailable}`
                );

                failureCount = 0;
                intervalTime = 60000; // reset interval

            } catch (err) {
                console.error('Error updating bot status:', err);
                failureCount++;
                intervalTime = Math.min(intervalTime * 2, 600000); // exponential backoff
                if (failureCount >= 3) {
                    const guild = client.guilds.cache.get(config.guildId);
                    if (guild) await setMaintenance(guild);
                }
            } finally {
                clearInterval(interval);
                interval = setInterval(updateStatus, intervalTime);
            }
        };

        await updateStatus();
        interval = setInterval(updateStatus, intervalTime);
    }
};
