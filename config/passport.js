'use strict';
const passport = require('passport')
  , localStrategy = require('passport-local').Strategy
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
// middleware
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

// custom function to validate
exports.isAuthenticated = (req, res, next)=>{
  if (req.isAuthenticated()) {
    return next();
  } else {
    res.redirect('/login');
  }
};
