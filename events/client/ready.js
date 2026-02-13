module.exports = {
    name: 'clientReady', // 🔹 v20 updated
    once: true,
    async execute(client) {
        console.log(`Logged in as ${client.user.tag}`);

        // Set bot presence to "Watching VEXI - BOT LOBBIES"
        try {
            await client.user.setPresence({
                status: 'online', // online, idle, dnd, invisible
                activities: [
                    {
                        name: 'VEXI - BOT LOBBIES', // text shown
                        type: 3 // 3 = Watching
                    }
                ]
            });
        } catch (err) {
            console.error('Failed to set bot presence:', err);
        }
    }
};
