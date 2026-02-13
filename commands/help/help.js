
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('List all available commands'),

    async execute(interaction, client) {
        const commands = client.commands;

        let description = "";

        commands.forEach(cmd => {
            description += `• /${cmd.data.name} - ${cmd.data.description}\n`;
        });

        await interaction.reply({
            content: `📖 **Command List**\n\n${description}`,
            ephemeral: true
        });
    }
};
