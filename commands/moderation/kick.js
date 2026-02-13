const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kick')
        .setDescription('Kick a member from the server')
        .addUserOption(option =>
            option.setName('target')
                .setDescription('User to kick')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for kicking the member')
                .setRequired(false)
        ),

    permissionLevel: "Mod",
    cooldown: 5,
    userPermissions: [PermissionFlagsBits.KickMembers],
    botPermissions: [PermissionFlagsBits.KickMembers],

    async execute(interaction) {
        const user = interaction.options.getUser('target');
        const reason = interaction.options.getString('reason') || 'No reason provided';
        const member = interaction.guild.members.cache.get(user.id);

        // User not found
        if (!member) {
            return interaction.reply({
                content: "❌ User not found.",
                flags: 64 // EPHEMERAL
            });
        }

        // Check if bot can kick this member
        if (!member.kickable) {
            return interaction.reply({
                content: "❌ I cannot kick this user. They may have higher role or be the owner.",
                flags: 64 // EPHEMERAL
            });
        }

        // Attempt to kick
        try {
            await member.kick(reason);
            await interaction.reply({
                content: `✅ Successfully kicked ${user.tag}\nReason: ${reason}`,
                flags: 64 // EPHEMERAL
            });
        } catch (error) {
            console.error(error);
            await interaction.reply({
                content: '⚠️ An error occurred while trying to kick this user.',
                flags: 64 // EPHEMERAL
            });
        }
    }
};
