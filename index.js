
const { Client, Collection, GatewayIntentBits, Partials } = require('discord.js');
const loadHandlers = require('./handlers/handlerLoader');
const { token } = require('./config.json');

const client = new Client({
    intents: Object.values(GatewayIntentBits),
    partials: Object.values(Partials)
});

client.commands = new Collection();
client.cooldowns = new Collection();

(async () => {
    await loadHandlers(client);
    client.login(token);
})();
