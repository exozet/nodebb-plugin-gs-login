/**
 * Created by marcel.ludwig on 17.12.15.
 */

var Settings = require.main.require('./src/settings'),
    winston = require.main.require('winston'),
    request = require.main.require('request');

var gamesparksCallbackService = (function () {
    var defaultSettings = {
        strings: {
            stage: 'preview', // stage | preview | live
            apiSecret: 'yourSecret',
            serverSecret: 'yourServerSecret'
        }
    };

    var mySettings = new Settings('gs-login', '1.0.0', defaultSettings, function () {
        winston.info('[gs-login] Settings successfully loaded.');
    });

    var sendPostRequest = function (payload, responseCallback) {

        payload.userAgent = 'NodeBB';    // since Gamesparks doesn't expose the Headers...

        var requestOptions = {
            url: 'https://preview.gamesparks.net/callback/' + mySettings.strings.apiSecret + '/' + mySettings.strings.serverSecret,
            headers: {
                'User-Agent' : 'NodeBB' // used on Gamesparks side to identify the post request.
            },
            body: JSON.stringify(payload)
        };

        request.post(requestOptions, responseCallback);

    };

    return {
        sendPostRequest: sendPostRequest
    };
})();

module.exports = gamesparksCallbackService;