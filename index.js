const { Client, Collection, GatewayIntentBits, Partials } = require('discord.js');
const loadHandlers = require('./handlers/handlerLoader');
const { token } = require('./config.json');

const client = new Client({
    // ✅ All Gateway Intents
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildBans,
        GatewayIntentBits.GuildEmojisAndStickers,
        GatewayIntentBits.GuildIntegrations,
        GatewayIntentBits.GuildWebhooks,
        GatewayIntentBits.GuildInvites,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildMessageTyping,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.DirectMessageReactions,
        GatewayIntentBits.DirectMessageTyping,
        GatewayIntentBits.MessageContent // Needed for content parsing
    ],

    // ✅ All Partials
    partials: [
        Partials.Channel,
        Partials.Message,
        Partials.Reaction,
        Partials.GuildMember,
        Partials.User,
        Partials.Thread,
        Partials.GuildScheduledEvent
    ]
});

// Collections for commands and cooldowns
client.commands = new Collection();
client.cooldowns = new Collection();

// Load handlers and login
(async () => {
    try {
        await loadHandlers(client);
        console.log('Logging in...');
        await client.login(token);
    } catch (error) {
        console.error('Failed to start bot:', error);
    }
})();
