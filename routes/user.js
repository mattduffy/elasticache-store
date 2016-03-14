'use strict';
const router = require('express').Router()
  , User = require('../models/user')
  , passport = require('passport')
  , passportCfg = require('../config/passport')
  ;

router.get('/signup', (req, res, next)=>{
  res.render('accounts/signup', {
    title: "create a new user",
    errors: req.flash('errors')
  });
});
router.post('/signup', (req, res, next)=>{
  console.log(req.body);
  let user = new User();
  user.profile.name = req.body.name;
  user.password = req.body.password;
  user.email = req.body.email;
  User.findOne({email: req.body.email}, (err, existingUser)=>{
    if(existingUser){
      //console.log(req.body.email , " already exists in the db.");
      req.flash('errors', "Account with that email address already exists.");
      return res.redirect('/signup');
    } else {
      user.save((err)=>{
        if(err) {
          return next(err);
        } else {
          //res.json("successfully flubbarded the new flinger.");
          res.redirect('/');
        }
      });
    }
  });
});

router.get('/profile', (req, res, next)=>{
  if (req.user) {
    let app = req.app.locals.app;
    User.findOne({_id: req.user._id}, (err, found)=>{
      if(err) return next(err);
      res.render('accounts/profile', {
        user: found,
        app: app,
        title: "My Clonie Profile",
        messages: req.flash('profile')});
    });
  }
});

router.get('/login', (req, res, next)=>{
  if(req.user) {
    return res.redirect('/profile');
  }
  let app = res.app.locals.app;
  res.render('accounts/login', {
    app: app,
    title: "Clonie Login",
    messages: req.flash('loginMessage')});
});

router.post('/login', (req, res, next)=>{
  //console.log("body parser stuff: ", req.body.password);
  next();
}, passport.authenticate('local-login', {
  successRedirect: '/profile',
  failureRedirect: '/login',
  failureFlash: true
}));
// router.post('/login', (req, res, next)=>{
//   let user = new User();
//   let password = req.body.password;
//   let id = req.body.id;
//   console.log(req.body);
//   User.findById(id, (err, result)=>{
//     if(err){
//       console.log("db error occurred" );
//       res.json({err: '404', msg:'DB error: ', err});
//     } else {
//       console.log("user: ", result);
//       result.comparePassword()
//       res.json(result);
//     }
//   });
// });

module.exports = router;
