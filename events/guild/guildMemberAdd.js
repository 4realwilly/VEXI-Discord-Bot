const { EmbedBuilder } = require('discord.js');
const { welcomeChannelId, autoRoleId } = require('../../config.json');

module.exports = {
    name: 'guildMemberAdd',
    once: false,
    async execute(member, client) {
        const guild = member.guild;

        try {
            const role = guild.roles.cache.get(autoRoleId);
            
            // ---------- Give the auto role only if the member is not a bot ----------
            if (!member.user.bot && role && !member.roles.cache.has(autoRoleId)) {
                await member.roles.add(role);
            }

            // ---------- Sync all real members (not bots) in batches ----------
            const members = await guild.members.fetch();
            const membersToUpdate = members.filter(
                m => !m.user.bot && role && !m.roles.cache.has(autoRoleId)
            );

            const batchSize = 10;
            const delay = 1500;

            const membersArray = Array.from(membersToUpdate.values());
            for (let i = 0; i < membersArray.length; i += batchSize) {
                const batch = membersArray.slice(i, i + batchSize);
                await Promise.all(batch.map(m => m.roles.add(role).catch(() => null)));
                await new Promise(res => setTimeout(res, delay));
            }

            // ---------- Count real members for "Nth member" ----------
            const realMembersCount = members.filter(m => !m.user.bot).size;

            // ---------- Send rich welcome embed ----------
            const channel = guild.channels.cache.get(welcomeChannelId);
            if (channel) {
                const embed = new EmbedBuilder()
                    .setTitle('🎉 Welcome to the server!')
                    .setDescription(
                        `Hello ${member.user}, welcome to **${guild.name}**! We’re thrilled to have you join us.\n\n` +
                        `• Check out <#1471948805611192472> to see how our Fortnite Lobbies Bots work\n` +
                        `• Make sure to read <#1471948813089378445> for the Discord rules (TOS)\n` +
                        `• Chat and hang out in <#1471948898024161501>\n` +
                        `• Need support? Visit <#1471948938624893089>\n\n` +
                        `You are the **${realMembersCount}th member**!`
                    )
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
