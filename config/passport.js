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
    console.log("inside passport local-login: ", email);
    User.findOne({email: email}, (err, user)=>{
      if (err) return done(err);

      if (!user) {
        return done(null, false, req.flash("loginMessage", "No user found for " + email));
      }
      if (!user.comparePassword(password)) {
        return done(null, false, req.flash("loginMessage", "Oops, wrong password, pal."));
      }
      return done(null, user, req.flash("loginMessage", "You are logged in as: " + email));
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
