const { EmbedBuilder } = require('discord.js');
const { welcomeChannelId, autoRoleId } = require('../../config.json');

module.exports = {
    name: 'guildMemberAdd',
    once: false,
    async execute(member, client) {
        const guild = member.guild;

        try {
            const role = guild.roles.cache.get(autoRoleId);
            if (!role) return console.error(`Auto role not found in guild ${guild.name}`);

            // ---------- Give the auto role to the joining member ----------
            if (!member.roles.cache.has(autoRoleId)) {
                await member.roles.add(role);
            }

            // ---------- Sync all members in batches to prevent overload ----------
            const members = await guild.members.fetch();
            const membersToUpdate = members.filter(m => !m.user.bot && !m.roles.cache.has(autoRoleId));

            const batchSize = 10; // number of members to update at once
            const delay = 1500; // 1.5s delay between batches

            const batches = [];
            for (let i = 0; i < membersToUpdate.size; i += batchSize) {
                batches.push(membersToUpdate.slice(i, i + batchSize));
            }

            for (const batch of batches) {
                await Promise.all(batch.map(m => m.roles.add(role).catch(() => null)));
                await new Promise(res => setTimeout(res, delay));
            }

            // ---------- Send welcome embed ----------
            const channel = guild.channels.cache.get(welcomeChannelId);
            if (channel) {
                const embed = new EmbedBuilder()
                    .setTitle('🎉 Welcome!')
                    .setDescription(`Welcome to **${guild.name}**, ${member.user}!`)
                    .setColor('#8A4FFF')
                    .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
                    .setFooter({
                        text: guild.name,
                        iconURL: client.user.displayAvatarURL()
                    });

                channel.send({ embeds: [embed] });
            }
        } catch (err) {
            console.error(`Error in guildMemberAdd for ${member.user.tag}:`, err);
        }
    }
};
