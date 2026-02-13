
const fs = require('fs');
const path = require('path');
const { REST, Routes } = require('discord.js');
const { clientId, token } = require('../config.json');

module.exports = async (client) => {
    const commands = [];
    const commandsPath = path.join(__dirname, '../commands');

    const loadFiles = (dir) => {
        const files = fs.readdirSync(dir);
        for (const file of files) {
            const fullPath = path.join(dir, file);
            if (fs.statSync(fullPath).isDirectory()) {
                loadFiles(fullPath);
            } else if (file.endsWith('.js')) {
                const command = require(fullPath);
                client.commands.set(command.data.name, command);
                commands.push(command.data.toJSON());
            }
        }
    };

    loadFiles(commandsPath);

    const rest = new REST({ version: '10' }).setToken(token);

    await rest.put(
        Routes.applicationCommands(clientId),
        { body: commands }
    );

    console.log("Global commands registered.");
};
