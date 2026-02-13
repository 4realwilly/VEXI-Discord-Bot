
const fs = require('fs');
const path = require('path');

module.exports = async (client) => {
    const handlersPath = path.join(__dirname);

    const files = fs.readdirSync(handlersPath)
        .filter(file => file.endsWith('.js') && file !== 'handlerLoader.js');

    for (const file of files) {
        const handler = require(`./${file}`);
        if (typeof handler === 'function') {
            await handler(client);
        }
    }
};
