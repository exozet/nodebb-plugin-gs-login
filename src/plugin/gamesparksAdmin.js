var Settings = require.main.require('./src/settings');
var winston = require.main.require('winston');
var SocketAdmin = require.main.require('./src/socket.io/admin');

/**
 * Admin Control Panel to configure the required settings.
 * @type {{onLoad, getConfig, admin}}
 */
var gamesparksAdmin = (function () {

    var app,
        settings,
        defaultSettings = {
        strings: {
            stage: 'preview', // stage | preview | live
            apiSecret: 'yourSecret',
            serverSecret: 'yourServerSecret'
        }
    };

    var renderACP = function (req, res, next) {
        res.render('admin/plugins/gslogin');
    };

    var adminSockets = {
        sync: function() {
            winston.info('[gs-login] syncing settings ...');
            settings.sync();
        }
    };

    var onLoad = function(params, callback) {
        settings = new Settings('gs-login', '1.0.0', defaultSettings);
        app = params.app;

        params.router.get('/admin/plugins/gs-login', params.middleware.admin.buildHeader, renderACP);
        params.router.get('/api/admin/plugins/gs-login', renderACP);

        SocketAdmin.settings.syncGsLogin = function () {
            adminSockets.sync();
        };

        callback();
    };

    // admin-panel
    var admin = {
        menu: function(header, callback) {
            header.plugins.push({
                "route": '/plugins/gs-login',
                "icon": 'fa-edit',
                "name": 'Gamesparks-Login'
            });

            callback(null, header);
        }
    };

    return {
        onLoad: onLoad,
        admin: admin
    };
})();

module.exports = gamesparksAdmin;