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
            if (hierarchy.indexOf(userLevel) < hierarchy.indexOf(command.permissionLevel)) {
                return interaction.reply({
                    content: `❌ Requires ${command.permissionLevel} level.`,
                    flags: 64 // 🔹 v20 ephemeral
                });
            }
        }

        /* ---------------- COOLDOWN SYSTEM ---------------- */

        const cooldown = command.cooldown || 3;

        if (!client.cooldowns.has(command.data.name)) {
            client.cooldowns.set(command.data.name, new Collection());
        }

        const timestamps = client.cooldowns.get(command.data.name);
        const now = Date.now();
        const cooldownAmount = cooldown * 1000;

        if (timestamps.has(interaction.user.id)) {
            const expiration = timestamps.get(interaction.user.id) + cooldownAmount;
            if (now < expiration) {
                const timeLeft = ((expiration - now) / 1000).toFixed(1);
                return interaction.reply({
                    content: `⏳ Wait ${timeLeft}s before reusing this command.`,
                    flags: 64 // 🔹 v20 ephemeral
                });
            }
        }

        timestamps.set(interaction.user.id, now);
        setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);

        /* ---------------- EXECUTE COMMAND ---------------- */

        try {
            await command.execute(interaction, client);
        } catch (error) {
            console.error(error);
            return interaction.reply({
                content: '⚠️ Error executing command.',
                flags: 64 // 🔹 v20 ephemeral
            });
        }
    }
};
