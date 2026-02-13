const fs = require('fs');
const path = require('path');

module.exports = async (client) => {
    const handlersPath = __dirname;

    const files = fs.readdirSync(handlersPath)
        .filter(file => file !== 'handlerLoader.js' && file.endsWith('.js'));

    for (const file of files) {
        const filePath = path.join(handlersPath, file);
        const handler = require(filePath);

        // ✅ Only load files explicitly marked as startup handlers
        if (typeof handler === 'function' && handler.startup === true) {
            await handler(client);
        }
    }

    console.log('Startup handlers loaded successfully.');
};
