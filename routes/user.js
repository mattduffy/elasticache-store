'use strict';
const router = require('express').Router()
  , User = require('../models/user')
  , passport = require('passport')
  , passportCfg = require('../config/passport')
  , async = require('async')
  , Cart = require('../models/cart.js')
  , util = require('util')
  ;

router.get('/signup', (req, res, next)=>{
  res.render('accounts/signup', {
    title: "create a new user",
    errors: req.flash('errors'),
    successes: req.flash('success')
  });
});
router.post('/signup', (req, res, next)=>{
  // console.log(req.body);
  async.waterfall([
    ((callback)=>{
      let user = new User();
      user.profile.name = req.body.name;
      user.password = req.body.password;
      user.email = req.body.email;
      user.profile.picture = user.gravatar();
      User.findOne({email: req.body.email}, (err, existingUser)=>{
        if(existingUser){
          //console.log(req.body.email , " already exists in the db.");
          req.flash('errors', "Account with that email address already exists.");
          return res.redirect('/signup');
        } else {
          user.save((err)=>{
            if(err) return next(err);
            callback(null, user);
          });
        }
      });
    }),
    ((user)=>{
      let cart = new Cart();
      cart.owner = user._id;
      cart.save((err)=>{
        if(err) return next(err);
        req.logIn(user, (error)=>{
          if(error) return next(error);
          res.redirect('/profile');
        });
      });
    })
  ]);
});

router.get('/test', (req,res,next)=>{
  console.log(util.inspect(passportCfg.isAuthenticated, {showHidden: true, depth: null, colors: true}));
  console.log(util.inspect(req.isAuthenticated, {showHidden: true, depth: null, colors: true}));
  return res.json({"samesies": (passportCfg.isAuthenticated == req.isAuthenticated)});
});

router.get('/profile', passportCfg.isAuthenticated, (req,res,next)=>{
  let u = User
    .findOne({_id: req.user._id})
    .populate('history.item');
    u.exec((err, foundUser)=>{
      if(err) return next(err);
      let app = req.app.locals.app;
      res.render('accounts/profile', {
        title: "Your Clonie profile",
        user: foundUser,
        app: app,
        errors: req.flash('loginMessages'),
        successes: req.flash('success'),
        messages: req.flash('message')
      });
    });
});

// router.get('/profile', (req, res, next)=>{
//   if (req.user) {
//     let app = req.app.locals.app;
//     User.findOne({_id: req.user._id}, (err, found)=>{
//       if(err) return next(err);
//       res.render('accounts/profile', {
//         user: found,
//         app: app,
//         title: "My Clonie Profile",
//         errors: req.flash('loginMessages'),
//         successes: req.flash('success'),
//         messages: req.flash('message')
//       });
//     });
//   }
// });

router.get('/login', (req, res, next)=>{
  if(req.user) {
    return res.redirect('/profile');
  }
  let app = res.app.locals.app;
  res.render('accounts/login', {
    app: app,
    title: "Clonie Login",
    errors: req.flash('loginMessages'),
    successes: req.flash('success')
  });
});

router.post('/login', (req, res, next)=>{
  //console.log("body parser stuff: ", req.body.password);
  next();
}, passport.authenticate('local-login', {
  successRedirect: '/profile',
  failureRedirect: '/login',
  failureFlash: true
}));

router.get('/logout', (req, res, next)=>{
  req.logout();
  // req.cart = null;
  res.redirect('/');
});

router.get('/edit-profile', (req, res, next)=>{
  let app = res.app.locals.app;
  res.render('accounts/edit-profile', {
    app: app,
    user: req.user,
    title: "Edit my profile",
    errors: req.flash('loginMessages'),
    successes: req.flash('success')
  });
});

router.post('/edit-profile', (req, res, next)=>{
  User.findOne({_id: req.user._id}, (error, found)=>{
    if(error) return next(error);
    if(req.body.name) found.profile.name = req.body.name;
    if(req.body.address) found.address = req.body.address;
    found.save((error)=>{
      if(error) return next(error);
      req.flash('success', "Successfully edited your profile.");
      res.redirect('/profile');
    });
  });
});

module.exports = router;
