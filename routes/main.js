'use strict';
const router = require('express').Router();



router.get('/', (req, res, next)=>{
  let app = res.app.locals.app;
  res.render('main/home', {
    'title': 'Clonie and me',
    app: app,
    profile: req.flash('profile')
  });
});
router.get('/about', (req, res, next)=>{
  res.render('main/about', {title: "About us"})
});

module.exports = router;
