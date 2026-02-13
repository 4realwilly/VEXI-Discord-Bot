
const { owners, adminRoles, modRoles } = require('../config.json');

module.exports = (interaction) => {
    if (owners.includes(interaction.user.id)) return "Owner";

    if (interaction.member) {
        const roles = interaction.member.roles.cache.map(r => r.name);

        if (roles.some(role => adminRoles.includes(role))) return "Admin";
        if (roles.some(role => modRoles.includes(role))) return "Mod";
    }

    return "User";
};
