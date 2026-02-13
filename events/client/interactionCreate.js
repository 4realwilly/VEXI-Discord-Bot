const { Collection } = require('discord.js');
const getPermissionLevel = require('../../handlers/permissionHandler');

const hierarchy = ["User", "Mod", "Admin", "Owner"];

module.exports = {
    name: 'interactionCreate',
    async execute(interaction, client) {
        if (!interaction.isChatInputCommand()) return;

        const command = client.commands.get(interaction.commandName);
        if (!command) return;

        /* ---------------- PERMISSION SYSTEM ---------------- */

        const userLevel = getPermissionLevel(interaction);

        if (command.permissionLevel) {
            if (
                hierarchy.indexOf(userLevel) <
                hierarchy.indexOf(command.permissionLevel)
            ) {
                return interaction.reply({
                    content: `❌ Requires ${command.permissionLevel} level.`,
                    ephemeral: true
                });
            }
        }

        /* ---------------- COOLDOWN SYSTEM ---------------- */

        const cooldown = command.cooldown || 3;

        if (!client.cooldowns.has(command.data.name)) {
            client.cooldowns.set(command.data.name, new Collection());
        }

        const now = Date.now();
        const timestamps = client.cooldowns.get(command.data.name);
        const cooldownAmount = cooldown * 1000;

        if (timestamps.has(interaction.user.id)) {
            const expiration = timestamps.get(interaction.user.id) + cooldownAmount;

            if (now < expiration) {
                const timeLeft = ((expiration - now) / 1000).toFixed(1);
                return interaction.reply({
                    content: `⏳ Wait ${timeLeft}s.`,
                    ephemeral: true
                });
            }
        }

        timestamps.set(interaction.user.id, now);
        setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);

        /* ---------------- EXECUTE ---------------- */

        try {
            await command.execute(interaction, client);
        } catch (error) {
            console.error(error);
            interaction.reply({
                content: '⚠️ Error executing command.',
                ephemeral: true
            });
        }
    }
};
