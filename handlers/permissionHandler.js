const { owners, adminRoles, modRoles } = require('../config.json');

module.exports = (interaction) => {
    // Safety check (prevents crash if ever called wrong)
    if (!interaction || !interaction.user) return "User";

    if (owners.includes(interaction.user.id)) return "Owner";

    if (interaction.member) {
        const roles = interaction.member.roles.cache.map(r => r.name);

        if (roles.some(role => adminRoles.includes(role))) return "Admin";
        if (roles.some(role => modRoles.includes(role))) return "Mod";
    }

    return "User";
};
