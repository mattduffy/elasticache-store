'use strict';
const passport = require('passport')
  , localStrategy = require('passport-local').Strategy
  , facebookStrategy = require('passport-facebook').Strategy
  , cfg = require('../config/')
  , User = require('../models/user')
  ;

// serialize and deserialize
passport.serializeUser((user, done)=>{
  done(null, user._id);
});
passport.deserializeUser((id, done)=>{
  User.findById(id, (err, user)=>{
    done(err, user);
  });
});
// local auth strategy middleware
passport.use('local-login', new localStrategy({
  usernameField: "email",
  passwordField: "password",
  passReqToCallback: true
  }, (req, email, password, done)=>{
    User.findOne({email: email}, (err, found)=>{
      if (err) {
        return done(err);
      } else if (!found) {
        return done(null, false, req.flash("loginMessage", "No user found for " + email));
      } else if (!found.comparePassword(password)) {
        return done(null, false, req.flash("loginMessage", "Oops, wrong password, pal."));
      } else {
        return done(null, found, req.flash("loginMessage", "You are logged in as: " + email));
      }
      console.log("fell out of auth if/then in local-login localStrategy.");
    });
  })
);

// facebook auth strategy middleware
passport.use('facebook-login', new facebookStrategy({
  clientID: cfg.FacebookAppID,
  clientSecret: cfg.FacebookAppSecret,
  profileFields: ['emails', 'displayName'],
  callbackURL: cfg.FacebookCallbackUrl
  },(token, refreshToken, profile, done)=>{
    User.findOne({facebook: profile.id}, (err, foundUser)=>{
      if(err) return done(err);
      if(foundUser) {
        return done(null, foundUser);
      } else {
        let newUser = new User();
        newUser.email = profile._json.email;
        newUser.facebook = profile.id;
        newUser.tokens.push({kind: 'facebook', token: token});
        newUser.profile.name = profile.displayName;
        newUser.profile.picture = "https://graph.facebook.com/"+profile.id+"/picture?type=large";
        newUser.save((err)=>{
          if(err) return done(err);
          return done(null, newUser);
        });
      }
    })
  }
));
// custom function to validate
exports.isAuthenticated = (req, res, next)=>{
  if (req.isAuthenticated()) {
    return next();
  } else {
    res.redirect('/login');
  }
};
