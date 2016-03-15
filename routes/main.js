'use strict';
const router = require('express').Router()
  , Category = require('../models/category')
  ;



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

router.get('/category', (req,res,next)=>{
  let app = res.app.locals.app;
  res.render('admin/category', {
    user: res.user,
    title: "Clonie categories",
    errors: req.flash('error'),
    successes: req.flash('success'),
    thisCategory: null
  });
});

router.get('/category/:categoryName', (req,res,next)=>{
  Category.findOne({name: req.params.categoryName}, (err, category)=>{
    if(err) return next(err);
    res.render('admin/category', {
      user: req.user,
      title: "Clonie: " + category.name,
      thisCategory: category,
      errors: req.flash('error'),
      successes: req.flash('success')
    });
  });
});

module.exports = router;
