var config = {};

config.mongoUri = 'Your MongoDB URL';
config.cookieMaxAge = 30 * 24 * 3600 * 1000;

//auth
config.facebookAuth = {
		'clientID' 		: 'Your App ID', // your App ID
		'clientSecret' 	: 'Your App secret', // your App Secret
		'callbackURL' 	: 'Your call back URI'
	};

config.twitterAuth = {
		'consumerID' 		: 'Your App ID', // your App ID
		'consumerSecret' 	: 'Your App secret', // your App Secret
		'callbackURL' 	: 'Your call back URI'
	};
	
config.googleAuth = {
		'clientID' 		: 'Your App ID', // your App ID
		'clientSecret' 	: 'Your App secret', // your App Secret
		'callbackURL' 	: 'Your call back URI'
	};
	
config.spotifyAuth = {
		'clientID' 		: 'Your App ID', // your App ID
		'clientSecret' 	: 'Your App secret', // your App Secret
		'callbackURL' 	: 'Your call back URI'
	};

config.deezerAuth = {
		'clientID' 		: 'Your App ID', // your App ID
		'clientSecret' 	: 'Your App secret', // your App Secret
		'callbackURL' 	: 'Your call back URI'
	};


module.exports = config;