var authOverride = require('./src/plugin/authOverrideLogin'),
    gsAdmin = require('./src/plugin/gamesparksAdmin');

module.exports = {
    login: authOverride.login,
    onLoad: gsAdmin.onLoad,
    admin: gsAdmin.admin
};