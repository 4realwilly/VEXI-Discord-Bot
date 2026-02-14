const { ChannelType } = require('discord.js');
const config = require('../../config.json');

module.exports = {
    name: 'clientReady',
    once: false,
    async execute(client) {

        let failureCount = 0;
        let intervalTime = 60000;
        let interval;

        const getLoadEmoji = (available, busy) => {
            const total = available + busy;
            if (total === 0) return '🔴';

            const load = busy / total;

            if (load < 0.5) return '🟢';
            if (load < 0.8) return '🟡';
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

                failureCount = 0;
                intervalTime = 60000;

                const publicData = data.public || {};
                const premiumData = data.vip || {};

                const publicAvailable = publicData.available || 0;
                const publicBusy = publicData.busy || 0;

                const premiumAvailable = premiumData.available || 0;
                const premiumBusy = premiumData.busy || 0;

                const publicEmoji = getLoadEmoji(publicAvailable, publicBusy);
                const premiumEmoji = getLoadEmoji(premiumAvailable, premiumBusy);

                const publicOnline = (publicAvailable + publicBusy) > 0;
                const premiumOnline = (premiumAvailable + premiumBusy) > 0;

                const totalLaunchAvailable =
                    publicAvailable + premiumAvailable;

                await updateChannel(
                    guild,
                    config.publicVcId,
                    `┊Public: ${publicOnline ? publicEmoji + ' Online' : '🔴 Offline'}`
                );

                await updateChannel(
                    guild,
                    config.premiumVcId,
                    `┊Premium: ${premiumOnline ? premiumEmoji + ' Online' : '🔴 Offline'}`
                );

                await updateChannel(
                    guild,
                    config.launchVcId,
                    `┊Launch: ${totalLaunchAvailable}`
                );

            } catch (err) {
                failureCount++;
                intervalTime = Math.min(intervalTime * 2, 600000);

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
