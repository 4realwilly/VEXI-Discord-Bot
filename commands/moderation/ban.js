const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Ban a member')
        .addUserOption(option =>
            option.setName('target')
                .setDescription('User to ban')
                .setRequired(true)
        ),

    permissionLevel: "Mod",
    cooldown: 5,
    userPermissions: [PermissionFlagsBits.BanMembers],
    botPermissions: [PermissionFlagsBits.BanMembers],

    async execute(interaction) {
        const user = interaction.options.getUser('target');
        const member = interaction.guild.members.cache.get(user.id);

        // User not found
        if (!member) {
            return interaction.reply({
                content: "❌ User not found.",
                flags: 64 // 🔹 EPHEMERAL
            });
        }

        // Check if bot can ban this member
        if (!member.bannable) {
            return interaction.reply({
                content: "❌ I cannot ban this user. They may have higher role or be the owner.",
                flags: 64 // 🔹 EPHEMERAL
            });
        }

        // Attempt to ban
        try {
            await member.ban();
            await interaction.reply({
                content: `✅ Successfully banned ${user.tag}`,
                flags: 64
            });
        } catch (error) {
            console.error(error);
            await interaction.reply({
                content: '⚠️ An error occurred while trying to ban this user.',
                flags: 64
            });
        }
    }
};
