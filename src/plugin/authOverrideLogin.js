/**
* Created by marcel.ludwig on 18.12.15.
*/
'use strict';

var passport = require.main.require('passport'),
    passportLocal = require.main.require('passport-local').Strategy,
    User = require.main.require('./src/user'),
    Groups = require.main.require('./src/groups'),
    meta = require.main.require('./src/meta'),
    db = require.main.require('./src/database'),
    fs = require.main.require('fs'),
    path = require.main.require('path'),
    nconf = require.main.require('nconf'),
    winston = require.main.require('winston'),
    async = require.main.require('async'),
    request = require.main.require('request'),
    gamesparks = require('./gamesparksCallbackService.js'),
    constants = Object.freeze({
        name: 'contentblvd'
    });

var OverrideLogin = (function () {

    /**
     * create a profile
     * @param data
     * @returns {Object}
     */
    var createProfile = function (data) {
        var profile = {};
        profile.id = data.id;
        profile.displayName = data.displayName;
        profile.email = data.email;
        profile.isAdmin = false;
        profile.picture = data.avatar;    //TODO: nice to have rendered inGame Avatar
        return profile;
    };

    var continueLogin = function (req, username, password, next) {

        var onAuthenticationSuccessful = function (responseBody) {
            var data = JSON.parse(responseBody);
            var profile = createProfile(data.player);
            moreLogin({
                CBid: profile.id,
                handle: profile.displayName,
                email: profile.email,
                isAdmin: profile.isAdmin,
                picture: profile.picture
            }, function (err, user) {
                if (err) {
                    return next(err);
                }
                var duration = 1000 * 60 * 60 * 24 * parseInt(meta.config.loginDays || 14, 10);
                req.session.cookie.maxAge = duration;
                req.session.cookie.expires = new Date(Date.now() + duration);
                next(null, user);
            });
        };

        var onResponseErrors = function(errors) {
          for(var i = 0; i < errors.length; i++)
          {
              winston.error('[gs-login] ' + errors[i].message);
          }
        };

        var onResponse = function (error, response, body) {
            winston.verbose('[gs-login] ' + body);
            if(response.statusCode !== 200) {
                var content = JSON.parse(body);
                if (content.errors || error) {
                    if (error) {
                        content.errors.push({message: error});
                    }
                    onResponseErrors(content.errors);
                    next(null, null);
                }
            } else if(response.statusCode === 200)
            {
                onAuthenticationSuccessful(body);
            }
        };

        var payload = {
            username: username,
            password: password
        };

        gamesparks.sendPostRequest(payload, onResponse);

    };

    var getUidByCBid = function (CBid, callback) {
        db.getObjectField(constants.name + 'Id:uid', CBid, function (err, uid) {
            if (err) {
                return callback(err);
            }
            callback(null, uid);
        });
    };

    var moreLogin = function (payload, callback) {
        if (payload) {
            winston.info('[gs-login] Payload: ' + payload);
            getUidByCBid(payload.CBid, function (err, uid) {
                if (err) {
                    return callback(err);
                }

                if (uid !== null) {
                    // Existing User
                    callback(null, {
                        uid: uid
                    });
                } else {
                    // New User
                    var success = function (uid) {
                        // Save provider-specific information to the user
                        User.setUserField(uid, constants.name + 'Id', payload.CBid);
                        db.setObjectField(constants.name + 'Id:uid', payload.CBid, uid);

                        if (payload.picture) {
                            var picture = payload.picture;
                            if (picture.match(/^http/i)) {
                                // already has domain
                            } else {
                                picture = 'https://d2m2amo0drgja.cloudfront.net/w400/' + picture;
                            }
                            User.setUserField(uid, 'uploadedpicture', picture);
                            User.setUserField(uid, 'picture', picture);
                        }

                        if (payload.isAdmin) {
                            Groups.join('administrators', uid, function (err) {
                                callback(null, {
                                    uid: uid
                                });
                            });
                        } else {
                            callback(null, {
                                uid: uid
                            });
                        }
                    };

                    User.getUidByEmail(payload.email, function (err, uid) {
                        if (err) {
                            return callback(err);
                        }

                        if (!uid) {
                            User.create({
                                username: payload.handle,
                                email: payload.email
                            }, function (err, uid) {
                                if (err) {
                                    return callback(err);
                                }

                                success(uid);
                            });
                        } else {
                            success(uid); // Existing account -- merge
                        }
                    });
                }

                // force username set by Gamesparks
                User.updateProfile(uid, { username : payload.handle }, function (err) {
                    if(err)
                    {
                        winston.error('[gs-login] ' + err);
                    }
                });
            });
        } else {
            winston.error('[gs-login] missing payload');
            if (callback) {
                callback(new Error('[[error:missing-payload]]'));
            }
        }
    };

    var login = function () {
        winston.info('[gs-login] Registering new local login strategy');
        passport.use(new passportLocal({passReqToCallback: true}, continueLogin));
    };

    return {
        login: login
    }
})();

module.exports = OverrideLogin;