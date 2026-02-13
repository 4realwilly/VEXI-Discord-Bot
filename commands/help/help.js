const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('List all available commands'),

    async execute(interaction, client) {
        let commandsMap = new Map();

        try {
            // Fetch global commands
            const globalCommands = await client.application.commands.fetch();
            globalCommands.forEach(cmd => commandsMap.set(cmd.name, cmd));

            // Fetch guild commands
            if (interaction.guild) {
                const guildCommands = await interaction.guild.commands.fetch();
                guildCommands.forEach(cmd => commandsMap.set(cmd.name, cmd));
            }
        } catch (err) {
            console.error('Error fetching commands for help:', err);
            return interaction.reply({
                content: '❌ Failed to fetch commands.',
                flags: 64
            });
        }

        if (!commandsMap.size) {
            return interaction.reply({
                content: 'No commands found.',
                flags: 64
            });
        }

        // Build command lines with hoverable clickable commands
        const commandLines = [];
        for (const cmd of commandsMap.values()) {
            commandLines.push(`• </${cmd.name}:${cmd.id}> - ${cmd.description || 'No description'}`);
        }

        // Split into multiple embeds if too long
        const embeds = [];
        const chunkSize = 25; // lines per embed
        for (let i = 0; i < commandLines.length; i += chunkSize) {
            const chunk = commandLines.slice(i, i + chunkSize);
            const embed = new EmbedBuilder()
                .setTitle(`${client.user.username} Command List`)
                .setDescription(chunk.join('\n'))
                .setColor('#8A4FFF')
                .setFooter({
                    text: interaction.guild ? `${interaction.guild.name} | ${Math.floor(i / chunkSize) + 1}/${Math.ceil(commandLines.length / chunkSize)}` : `VEXI - BOT LOBBIES | ${Math.floor(i / chunkSize) + 1}/${Math.ceil(commandLines.length / chunkSize)}`,
                    iconURL: client.user.displayAvatarURL()
                });

            embeds.push(embed);
        }

        // Send embeds in DM
        try {
            for (const embed of embeds) {
                await interaction.user.send({ embeds: [embed] });
            }

            await interaction.reply({
                content: '📬 I\'ve sent you a DM with the command list!',
                flags: 64
            });
        } catch (error) {
            console.error('Failed to send help DM:', error);
            await interaction.reply({
                content: '❌ I couldn\'t send you a DM. Do you have DMs disabled?',
                flags: 64
            });
        }
    }
};
