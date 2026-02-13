const fs = require('fs');
const path = require('path');

const eventHandler = async (client) => {
    const eventsPath = path.join(__dirname, '../events');

    const loadEvents = (dir) => {
        const files = fs.readdirSync(dir);

        for (const file of files) {
            const fullPath = path.join(dir, file);

            if (fs.statSync(fullPath).isDirectory()) {
                loadEvents(fullPath);
            } else if (file.endsWith('.js')) {
                const event = require(fullPath);

                if (dir.includes('process')) {
                    process.on(event.name, (...args) =>
                        event.execute(...args, client)
                    );
                } else {
                    if (event.once) {
                        client.once(event.name, (...args) =>
                            event.execute(...args, client)
                        );
                    } else {
                        client.on(event.name, (...args) =>
                            event.execute(...args, client)
                        );
                    }
                }
            }
        }
    };

    loadEvents(eventsPath);

    console.log('Events loaded.');
};

module.exports = eventHandler;
module.exports.startup = true; // ✅ Important
