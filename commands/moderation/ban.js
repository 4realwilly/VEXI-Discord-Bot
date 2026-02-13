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

        if (!member) return interaction.reply({ content: "User not found.", ephemeral: true });

        // ✅ Check if bot can actually ban this member
        if (!member.bannable) {
            return interaction.reply({
                content: "❌ I cannot ban this user. They may have higher role or be the owner.",
                ephemeral: true
            });
        }

        await member.ban();
        interaction.reply(`✅ Banned ${user.tag}`);
    }
};
