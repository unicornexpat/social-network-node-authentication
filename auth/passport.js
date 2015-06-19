module.exports = function() {
    // load all the things we need
    var passport = require('passport');
    var LocalStrategy = require('passport-local').Strategy;
    var FacebookStrategy = require('passport-facebook').Strategy;
    var SpotifyStrategy = require('passport-spotify').Strategy;
    var DeezerStrategy = require('passport-deezer').Strategy;
    var TwitterStrategy = require('passport-twitter').Strategy;
    var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
    var userService = require('../services/user-service'); //serprate user service


    // load up the user model
    var User = require('../models/user').User;

    // load the auth variables
    var configAuth = require('../config'); // use this one for testing
    // =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });

    // =========================================================================
    // LOCAL LOGIN =============================================================
    // =========================================================================
    passport.use('local-login', new LocalStrategy({
            // by default, local strategy uses username and password, we will override with email
            usernameField: 'email',
            passwordField: 'password',
            passReqToCallback: true // allows us to pass in the req from our route (lets us check if a user is logged in or not)
        },
        function(req, email, password, done) {
            process.nextTick(function() {
                userService.findLocal(email, function(err, user) {
                    // if there are any errors, return the error
                    if (err)
                        return done(err);
                    // if no user is found, return the message
                    if (!user)
                        return done(null, false, req.flash('loginMessage', 'No user found.'));
                    if (!user.validPassword(password))
                        return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.'));
                    // all is well, return user
                    else
                    return done(null, user);
                });
            });

        }));

    // =========================================================================
    // LOCAL SIGNUP ============================================================
    // =========================================================================
    passport.use('local-signup', new LocalStrategy({
            // by default, local strategy uses username and password, we will override with email
            usernameField: 'email',
            passwordField: 'password',
            passReqToCallback: true // allows us to pass in the req from our route (lets us check if a user is logged in or not)
        },
        function(req, email, password, done) {
            // asynchronous
            process.nextTick(function() {
                //  Whether we're signing up or connecting an account, we'll need
                //  to know if the email address is in use.
                userService.findLocal(email, function(err, existingUser) {
                    // if there are any errors, return the error
                    if (err)
                        return done(err);
                    // check to see if there's already a user with that email
                    if (existingUser)
                        return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
                    //  If we're logged in, we're connecting a new local account.
                    if (req.user) {
                        userService.connectLocal(req.user, email, password, function(err, user) {
                            if (err) {
                                console.log(err);
                                return done(null, false, req.flash('signupMessage', 'Connect Local Account Failed'));
                            }
                            return done(null, user);
                        });
                    }
                    //  We're not logged in, so we're creating a brand new user.
                    else {
                        // create the user
                        userService.createLocal(email, password, function(err, newUser) {
                            if (err) {
                                console.log(err);
                                return done(null, false, req.flash('signupMessage', 'Create Local Account Failed'));
                            }
                            return done(null, newUser);
                        });
                    }
                });
            });
        }));

    /// =========================================================================
    // FACEBOOK ================================================================
    // =========================================================================
    passport.use(new FacebookStrategy({
            clientID: configAuth.facebookAuth.clientID,
            clientSecret: configAuth.facebookAuth.clientSecret,
            callbackURL: configAuth.facebookAuth.callbackURL,
            passReqToCallback: true // allows us to pass in the req from our route (lets us check if a user is logged in or not)
        },
        function(req, token, refreshToken, profile, done) {

            // asynchronous
            process.nextTick(function() {

                // check if the user is already logged in
                if (!req.user) {

                    userService.findSocial('facebook', profile.id, function(err, user) {
                        if (err) {
                            console.log(err);
                            return done(err);
                        }
                        if (user) {
                            // if there is a user id already but no token (user was linked at one point and then removed)
                            if (!user.facebook.token) {
                                userService.reconnectSocial('facebook', user, token, profile, function(err, user) {
                                    if (err) {
                                        console.log(err);
                                        throw err;
                                    }
                                    return done(null, user);
                                });
                            }
                            return done(null, user); // user found, return that user
                        }
                        else {
                            // if there is no user, create them
                            userService.createSocial('facebook', token, profile, function(err, newUser) {
                                if (err)
                                    throw err;
                                return done(null, newUser);
                            });
                        }
                    });
                }
                else {
                    // user already exists and is logged in, we have to link accounts
                    userService.connectSocial('facebook', req.user, token, profile, function(err, newUser) {
                        if (err)
                            throw err;
                        return done(null, newUser);
                    });
                }
            });
        }));

    /// =========================================================================
    // twitter ================================================================
    // =========================================================================
    passport.use(new TwitterStrategy({
            consumerKey: configAuth.twitterAuth.consumerKey,
            consumerSecret: configAuth.twitterAuth.consumerSecret,
            callbackURL: configAuth.twitterAuth.callbackURL,
            passReqToCallback: true // allows us to pass in the req from our route (lets us check if a user is logged in or not)
        },
        function(req, token, refreshToken, profile, done) {
            // asynchronous
            process.nextTick(function() {
                // check if the user is already logged in
                if (!req.user) {
                    userService.findSocial('twitter', profile.id, function(err, user) {
                        if (err) {
                            console.log(err);
                            return done(err);
                        }
                        if (user) {
                            // if there is a user id already but no token (user was linked at one point and then removed)
                            if (!user.twitter.token) {
                                userService.reconnectSocial('twitter', user, token, profile, function(err, user) {
                                    if (err) {
                                        console.log(err);
                                        throw err;
                                    }
                                    return done(null, user);
                                });
                            }
                            return done(null, user); // user found, return that user
                        }
                        else {
                            // if there is no user, create them
                            userService.createSocial('twitter', token, profile, function(err, newUser) {
                                if (err)
                                    throw err;
                                return done(null, newUser);
                            });
                        }
                    });
                }
                else {
                    // user already exists and is logged in, we have to link accounts
                    userService.connectSocial('twitter', req.user, token, profile, function(err, newUser) {
                        if (err)
                            throw err;
                        return done(null, newUser);
                    });
                }
            });

        }));

    /// =========================================================================
    // google ================================================================
    // =========================================================================
    passport.use(new GoogleStrategy({

            clientID: configAuth.googleAuth.clientID,
            clientSecret: configAuth.googleAuth.clientSecret,
            callbackURL: configAuth.googleAuth.callbackURL,
            passReqToCallback: true // allows us to pass in the req from our route (lets us check if a user is logged in or not)

        },
        function(req, token, refreshToken, profile, done) {

            // asynchronous
            process.nextTick(function() {

                // check if the user is already logged in
                if (!req.user) {

                    userService.findSocial('google', profile.id, function(err, user) {
                        if (err) {
                            console.log(err);
                            return done(err);
                        }
                        if (user) {
                            // if there is a user id already but no token (user was linked at one point and then removed)
                            if (!user.google.token) {
                                userService.reconnectSocial('google', user, token, profile, function(err, user) {
                                    if (err) {
                                        console.log(err);
                                        throw err;
                                    }
                                    return done(null, user);
                                });
                            }
                            return done(null, user); // user found, return that user
                        }
                        else {
                            // if there is no user, create them
                            userService.createSocial('google', token, profile, function(err, newUser) {
                                if (err)
                                    throw err;
                                return done(null, newUser);
                            });
                        }
                    });
                }
                else {
                    // user already exists and is logged in, we have to link accounts
                    userService.connectSocial('google', req.user, token, profile, function(err, newUser) {
                        if (err)
                            throw err;
                        return done(null, newUser);
                    });
                }
            });

        }));

    /// =========================================================================
    // spotify ================================================================
    // =========================================================================
    passport.use(new SpotifyStrategy({

            clientID: configAuth.spotifyAuth.clientID,
            clientSecret: configAuth.spotifyAuth.clientSecret,
            callbackURL: configAuth.spotifyAuth.callbackURL,
            passReqToCallback: true // allows us to pass in the req from our route (lets us check if a user is logged in or not)
        },
        function(req, token, refreshToken, profile, done) {
            // asynchronous
            process.nextTick(function() {
                // check if the user is already logged in
                if (!req.user) {
                    userService.findSocial('spotify', profile.id, function(err, user) {
                        if (err) {
                            console.log(err);
                            return done(err);
                        }
                        if (user) {
                            // if there is a user id already but no token (user was linked at one point and then removed)
                            if (!user.spotify.token) {
                                userService.reconnectSocial('spotify', user, token, profile, function(err, user) {
                                    if (err) {
                                        console.log(err);
                                        throw err;
                                    }
                                    return done(null, user);
                                });
                            }
                            return done(null, user); // user found, return that user
                        }
                        else {
                            // if there is no user, create them
                            userService.createSocial('spotify', token, profile, function(err, newUser) {
                                if (err)
                                    throw err;
                                return done(null, newUser);
                            });
                        }
                    });
                }
                else {
                    // user already exists and is logged in, we have to link accounts
                    userService.connectSocial('spotify', req.user, token, profile, function(err, newUser) {
                        if (err)
                            throw err;
                        return done(null, newUser);
                    });
                }
            });
        }));

    /// =========================================================================
    // deezer ================================================================
    // =========================================================================
    passport.use(new DeezerStrategy({

            clientID: configAuth.deezerAuth.clientID,
            clientSecret: configAuth.deezerAuth.clientSecret,
            callbackURL: configAuth.deezerAuth.callbackURL,
            passReqToCallback: true // allows us to pass in the req from our route (lets us check if a user is logged in or not)
        },
        function(req, token, refreshToken, profile, done) {
            // asynchronous
            process.nextTick(function() {
                // check if the user is already logged in
                if (!req.user) {
                    userService.findSocial('deezer', profile.id, function(err, user) {
                        if (err) {
                            console.log(err);
                            return done(err);
                        }
                        if (user) {
                            // if there is a user id already but no token (user was linked at one point and then removed)
                            if (!user.deezer.token) {
                                userService.reconnectSocial('deezer', user, token, profile, function(err, user) {
                                    if (err) {
                                        console.log(err);
                                        throw err;
                                    }
                                    return done(null, user);
                                });
                            }
                            return done(null, user); // user found, return that user
                        }
                        else {
                            // if there is no user, create them
                            userService.createSocial('deezer', token, profile, function(err, newUser) {
                                if (err)
                                    throw err;
                                return done(null, newUser);
                            });
                        }
                    });
                }
                else {
                    // user already exists and is logged in, we have to link accounts
                    userService.connectSocial('deezer', req.user, token, profile, function(err, newUser) {
                        if (err)
                            throw err;
                        return done(null, newUser);
                    });
                }
            });
        }));





};