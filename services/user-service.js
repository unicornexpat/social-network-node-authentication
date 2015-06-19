var bcrypt = require('bcrypt');
var User = require('../models/user').User;

exports.findLocal = function(email, next) {
    User.findOne({'local.email': email.toLowerCase()}, function(err, user) {
      next(err, user);    
    });
};

exports.findSocial = function(type, id, next){
  switch(type){
    case 'facebook':
      User.findOne({'facebook.id': id}, function(err, user) {
        return next(err, user);    
      });
      break;
    case 'twitter':
      User.findOne({'twitter.id': id}, function(err, user) {
        return next(err, user);    
      });
      break;
    case 'google':
      User.findOne({'google.id': id}, function(err, user) {
        return next(err, user);    
      });
      break;
    case 'spotify':
      User.findOne({'spotify.id': id}, function(err, user) {
        return next(err, user);    
      });
      break;
    case 'deezer':
      User.findOne({'deezer.id': id}, function(err, user) {
        return next(err, user);    
      });
      break;
    default:
      console.log('Find Social Default');
  }
};

exports.connectLocal = function(reqUser, email, password, next){
  var user = reqUser;
  user.local.email    = email;
  user.local.password = user.generateHash(password);
  user.save(function(err) {
      if (err)
          return next(err, null);
      next(null, user);
  });
};

exports.connectSocial = function(type, reqUser, token, profile, next){
  var user = reqUser;
  switch(type) {
    case "facebook":
      user.facebook.id    = profile.id;
      user.facebook.token = token;
      user.facebook.name  = profile.name.givenName + ' ' + profile.name.familyName;
      user.facebook.email = profile.emails[0].value;
      user.save(function(err) {
          if (err)
              return next(err, null);
          return next(null, user);
      });
      break;
    case "twitter":
      user.twitter.id    = profile.id;
      user.twitter.token = token;
      user.twitter.name  = profile.username;
      user.twitter.displayName = profile.displayName;
      user.save(function(err) {
          if (err)
              return next(err, null);
          return next(null, user);
      });
      break;
    case "google":
      user.google.id    = profile.id;
      user.google.token = token;
      user.google.name  = profile.displayName;
      user.google.email = profile.emails[0].value;
      user.save(function(err) {
          if (err)
              return next(err, null);
          return next(null, user);
      });
      break;
    case "spotify":
      user.spotify.id    = profile.id;
      user.spotify.token = token;
      user.spotify.name  = profile.displayName;
      user.spotify.email = profile.emails[0].value;
      user.save(function(err) {
          if (err)
              return next(err, null);
          return next(null, user);
      });
      break;
    case "deezer":
      user.deezer.id    = profile.id;
      user.deezer.token = token;
      user.deezer.name  = profile.name.givenName + ' ' + profile.name.familyName;
      user.deezer.email = profile.emails[0].value;
      user.save(function(err) {
          if (err)
              return next(err, null);
          return next(null, user);
      });
      break;
    default:
      console.log('Connect Social Default');
    
  }
};

exports.reconnectSocial = function(type, user, token, profile, next){
  switch(type) {
    case "facebook":
      user.facebook.token = token;
      user.facebook.name  = profile.name.givenName + ' ' + profile.name.familyName;
      user.facebook.email = profile.emails[0].value;
      user.save(function(err) {
          if (err)
              return next(err, null);
          return next(null, user);
      });
      break;
    case "twitter":
      user.twitter.token = token;
      user.twitter.name  = profile.username;
      user.twitter.displayName = profile.displayName;
      user.save(function(err) {
          if (err)
              return next(err, null);
          return next(null, user);
      });
      break;
    case "google":
      user.google.token = token;
      user.google.name  = profile.displayName;
      user.google.email = profile.emails[0].value;
      user.save(function(err) {
          if (err)
              return next(err, null);
          return next(null, user);
      });
      break;
    case "spotify":
      user.spotify.token = token;
      user.spotify.name  = profile.displayName;
      user.spotify.email = profile.emails[0].value;
      user.save(function(err) {
          if (err)
              return next(err, null);
          return next(null, user);
      });
      break;
    case "deezer":
      user.deezer.token = token;
      user.deezer.name  = profile.name.givenName + ' ' + profile.name.familyName;
      user.deezer.email = profile.emails[0].value;
      user.save(function(err) {
          if (err)
              return next(err, null);
          return next(null, user);
      });
      break;
    default:
      console.log('Reconnect Social Default');
  }
};

exports.disconnectSocial = function(type, reqUser, next){
  var user = reqUser;
  switch(type) {
    case "facebook":
      user.facebook.token = undefined;
      user.save(function(err){
        if(err)
          return next(err);
        return next(null);
      });
      break;
    case "twitter":
      user.twitter.token = undefined;
      user.save(function(err){
        if(err)
          return next(err);
        return next(null);
      });
      break;
    case "google":
      user.google.token = undefined;
      user.save(function(err){
        if(err)
          return next(err);
        return next(null);
      });
      break;
    case "spotify":
      user.spotify.token = undefined;
      user.save(function(err){
        if(err)
          return next(err);
        return next(null);
      });
      break;
    case "deezer":
      user.deezer.token = undefined;
      user.save(function(err){
        if(err)
          return next(err);
        return next(null);
      });
      break;
    default:
      console.log('Disconnect Default');
  }
};



exports.createLocal = function(email, password, next){
  var newUser =  new User();
  newUser.local.email    = email;
  newUser.local.password = newUser.generateHash(password);
  newUser.save(function(err) {
      if (err)
          return next(err, null);
      return next(null, newUser);
  });
};

exports.createSocial = function(type, token, profile, next){
  var newUser =  new User();
  switch(type){
    case 'facebook':
      newUser.facebook.id    = profile.id;
      newUser.facebook.token = token;
      newUser.facebook.name  = profile.name.givenName + ' ' + profile.name.familyName;
      newUser.facebook.email = profile.emails[0].value;
      newUser.save(function(err) {
          if (err)
              return next(err, null);
          return next(null, newUser);
      });
      break;
    case 'twitter':
      newUser.twitter.id    = profile.id;
      newUser.twitter.token = token;
      newUser.twitter.name  = profile.name;
      newUser.twitter.displayName = profile.displayName;
      newUser.save(function(err) {
          if (err)
              return next(err, null);
          return next(null, newUser);
      });
      break;
    case 'google':
      newUser.google.id    = profile.id;
      newUser.google.token = token;
      newUser.google.name  = profile.displayName;
      newUser.google.email = profile.emails[0].value;
      newUser.save(function(err) {
          if (err)
              return next(err, null);
          return next(null, newUser);
      });
      break;
    case 'spotify':
      newUser.spotify.id    = profile.id;
      newUser.spotify.token = token;
      newUser.spotify.name  = profile.displayName;
      newUser.spotify.email = profile.emails[0].value;
      newUser.save(function(err) {
          if (err)
              return next(err, null);
          return next(null, newUser);
      });
      break;
    case 'deezer':
      newUser.deezer.id    = profile.id;
      newUser.deezer.token = token;
      newUser.deezer.name  = profile.name.givenName + ' ' + profile.name.familyName;
      newUser.deezer.email = profile.emails[0].value;
      newUser.save(function(err) {
          if (err)
              return next(err, null);
          return next(null, newUser);
      });
      break;
    default:
      console.log('Create Social Default');
  }
};









