var express = require('express');
var router = express.Router();
var passport = require('passport');
var userService = require('../services/user-service');
var config = require('../config');
var restrict = require('../auth/restrict');
var unrestrict = require('../auth/unrestrict');


// normal routes ===============================================================
	// show the home page (will also have our login links)
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

// PROFILE SECTION =========================
router.get('/profile', restrict, function(req, res) {
	res.render('users/profile.hbs', {
		user : req.user
	});
});

// LOGOUT ==============================
router.get('/logout', restrict,  function(req, res, next) {
  req.logout();
  req.session.destroy();
  res.redirect('/');
});

// =============================================================================
// AUTHENTICATE (FIRST LOGIN) ==================================================
// =============================================================================
// LOCALLY --------------------------------
// LOGIN ===============================
// show the login form
router.get('/login', unrestrict, function(req, res) {
	res.render('users/login.hbs', { message: req.flash('loginMessage') });
});
// process the login form
router.post('/login', passport.authenticate('local-login', {
	successRedirect : '/users/profile', // redirect to the secure profile section
	failureRedirect : '/users/login', // redirect back to the signup page if there is an error
	failureFlash : true // allow flash messages
}));

// SIGNUP =================================
// show the signup form
router.get('/signup', unrestrict, function(req, res) {
	res.render('users/signup.hbs', { vm: req.flash('loginMessage') });
});
// process the signup form
router.post('/signup', passport.authenticate('local-signup', {
	successRedirect : '/users/profile', // redirect to the secure profile section
	failureRedirect : '/users/signup', // redirect back to the signup page if there is an error
	failureFlash : true // allow flash messages
}));


// FACEBOOK -------------------------------
// send to facebook to do the authentication
router.get('/auth/facebook', passport.authenticate('facebook', { scope : 'email' }));

// handle the callback after facebook has authenticated the user
router.get('/auth/facebook/callback',
	passport.authenticate('facebook', {
		successRedirect : '/users/profile',
		failureRedirect : '/users/'
	}));
	
// SPOTIFY -------------------------------
// send to spotify to do the authentication
router.get('/auth/spotify', passport.authenticate('spotify', { scope : 'user-read-private user-read-email' }));
// handle the callback after spotify has authenticated the user
router.get('/auth/spotify/callback',
	passport.authenticate('spotify', {
		successRedirect : '/users/profile',
		failureRedirect : '/users/'
	}));
	
//=============DEEZER=============
// send to deezer to do the authentication
router.get('/auth/deezer', passport.authenticate('deezer', { scope: ['user-read-email', 'user-read-private'] }));
// handle the callback after deezer has authenticated the user
router.get('/auth/deezer/callback',
	passport.authenticate('deezer', {
		successRedirect : '/users/profile',
		failureRedirect : '/users/'
	}));

//=============TWITTER=============
// send to twitter to do the authentication
router.get('/auth/twitter', passport.authenticate('twitter', { scope : 'email' }));
// handle the callback after twitter has authenticated the user
router.get('/auth/twitter/callback',
	passport.authenticate('twitter', {
		successRedirect : '/users/profile',
		failureRedirect : '/users/'
	}));


//=============GOOGLE=============
// send to google to do the authentication
router.get('/auth/google', passport.authenticate('google', { scope : ['profile', 'email'] }));
// the callback after google has authenticated the user
router.get('/auth/google/callback',
	passport.authenticate('google', {
		successRedirect : '/users/profile',
		failureRedirect : '/users/'
	}));

// =============================================================================
// AUTHORIZE (ALREADY LOGGED IN / CONNECTING OTHER SOCIAL ACCOUNT) =============
// =============================================================================

// LOCALLY --------------------------------
router.get('/connect/local', function(req, res) {
	res.render('connect-local.hbs', { message: req.flash('loginMessage') });
});
router.post('/connect/local', passport.authenticate('local-signup', {
	successRedirect : '/users/profile', // redirect to the secure profile section
	failureRedirect : '/users/connect/local', // redirect back to the signup page if there is an error
	failureFlash : true // allow flash messages
}));

// FACEBOOK -------------------------------
// send to facebook to do the authentication
router.get('/connect/facebook', passport.authorize('facebook', { scope : 'email' }));
// handle the callback after facebook has authorized the user
router.get('/connect/facebook/callback',
	passport.authorize('facebook', {
		successRedirect : '/users/profile',
		failureRedirect : '/users/'
	}));
	
// SPOTIFY -------------------------------
// send to spotify to do the authentication
router.get('/connect/spotify', passport.authorize('spotify', {scope: ['user-read-email', 'user-read-private'], showDialog: true}));

// handle the callback after spotify has authorized the user
router.get('/connect/spotify/callback',
	passport.authorize('spotify', {
		successRedirect : '/users/profile',
		failureRedirect : '/users/'
	}));

// DEEZER -------------------------------
// send to deezer to do the authentication
router.get('/connect/deezer', passport.authorize('deezer', { scope : 'email' }));

// handle the callback after deezer has authorized the user
router.get('/connect/deezer/callback',
	passport.authorize('deezer', {
		successRedirect : '/users/profile',
		failureRedirect : '/users/'
	}));
	
// TWITER --------------------------------
// send to twitter to do the authentication
router.get('/connect/twitter', passport.authorize('twitter', { scope : 'email' }));
// handle the callback after twitter has authorized the user
router.get('/connect/twitter/callback',
	passport.authorize('twitter', {
		successRedirect : '/users/profile',
		failureRedirect : '/users/'
	}));


// GOOGLE ---------------------------------
// send to google to do the authentication
router.get('/connect/google', passport.authorize('google', { scope : ['profile', 'email'] }));

// the callback after google has authorized the user
router.get('/connect/google/callback',
	passport.authorize('google', {
		successRedirect : '/users/profile',
		failureRedirect : '/users/'
	}));

// =============================================================================
// UNLINK ACCOUNTS =============================================================
// =============================================================================
// used to unlink accounts. for social accounts, just remove the token
// for local account, remove email and password
// user account will stay active in case they want to reconnect in the future

// LOCAL -----------------------------------
router.get('/unlink/local', function(req, res) {
	var user            = req.user;
	user.local.email    = undefined;
	user.local.password = undefined;
	user.save(function(err) {
		res.redirect('/users/profile');
	});
});

// FACEBOOK -------------------------------
router.get('/unlink/facebook', function(req, res) {
	userService.disconnectSocial('facebook', req.user, function(err){
		if (err){
			console.log(err);
			res.send('Disconnect failed');
		}
		res.redirect('/users/profile');
	});
});

// SPOTIFY -------------------------------
router.get('/unlink/spotify', function(req, res) {
	userService.disconnectSocial('spotify', req.user, function(err){
		if (err){
			console.log(err);
			res.send('Disconnect failed');
		}
		res.redirect('/users/profile');
	});
});

// DEEZER -------------------------------
router.get('/unlink/deezer', function(req, res) {
	userService.disconnectSocial('deezer', req.user, function(err){
		if (err){
			console.log(err);
			res.send('Disconnect failed');
		}
		res.redirect('/users/profile');
	});
});

// TWITTER -------------------------------
router.get('/unlink/twitter', function(req, res) {
	userService.disconnectSocial('twitter', req.user, function(err){
		if (err){
			console.log(err);
			res.send('Disconnect failed');
		}
		res.redirect('/users/profile');
	});
});

// GOOGLE -------------------------------
router.get('/unlink/google', function(req, res) {
	userService.disconnectSocial('google', req.user, function(err){
		if (err){
			console.log(err);
			res.send('Disconnect failed');
		}
		res.redirect('/users/profile');
	});
});

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
	if (req.isAuthenticated())
		return next();
	res.redirect('/');
}

module.exports = router;
