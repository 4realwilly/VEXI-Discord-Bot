// events/client/clientReady.js
module.exports = {
    name: 'clientReady', // 🔹 updated
    once: true,
    execute(client) {
        console.log(`Logged in as ${client.user.tag}`);
    }
};
