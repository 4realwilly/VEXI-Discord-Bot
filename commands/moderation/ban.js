
const { SlashCommandBuilder } = require('discord.js');

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

    async execute(interaction) {
        const user = interaction.options.getUser('target');
        const member = interaction.guild.members.cache.get(user.id);

        if (!member) return interaction.reply({ content: "User not found.", ephemeral: true });

        await member.ban();
        interaction.reply(`Banned ${user.tag}`);
    }
};
