const { ChannelType } = require('discord.js');
const config = require('../../config.json');

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

            if (channel.name !== newName) {
                await channel.setName(newName).catch(() => {});
            }
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
                const res = await fetch('https://api.fnlb.net/bots/stats/', {
                    headers: {
                        'Authorization': `Bearer ${config.fnlbApiKey}`
                    }
                });

                if (!res.ok) throw new Error('API Error');

                const data = await res.json();

                // Reset failure state
                failureCount = 0;
                intervalTime = 60000;

                const pub = data.public || {};
                const vip = data.vip || {};

                const pubAvailable = pub.available || 0;
                const pubBusy = pub.busy || 0;

                const vipAvailable = vip.available || 0;
                const vipBusy = vip.busy || 0;

                const pubEmoji = getLoadEmoji(pubAvailable, pubBusy);
                const vipEmoji = getLoadEmoji(vipAvailable, vipBusy);

                const pubOnline = (pubAvailable + pubBusy) > 0;
                const vipOnline = (vipAvailable + vipBusy) > 0;

                const totalAvailable = pubAvailable + vipAvailable;

                await updateChannel(
                    guild,
                    config.publicVcId,
                    `┊Public: ${pubOnline ? pubEmoji + ' Online' : '🔴 Offline'}`
                );

                await updateChannel(
                    guild,
                    config.premiumVcId,
                    `┊Premium: ${vipOnline ? vipEmoji + ' Online' : '🔴 Offline'}`
                );

                await updateChannel(
                    guild,
                    config.launchVcId,
                    `┊Launch: ${totalAvailable}`
                );

            } catch (err) {
                failureCount++;
                intervalTime = Math.min(intervalTime * 2, 600000); // max 10 mins

                if (failureCount >= 3) {
                    await setMaintenance(guild);
                }

                clearInterval(interval);
                interval = setInterval(updateStatus, intervalTime);
            }
        };

        await updateStatus();
        interval = setInterval(updateStatus, intervalTime);
    }
};
