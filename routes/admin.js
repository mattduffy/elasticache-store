'use strict';
const router = require('express').Router()
  , Category = require('../models/category')
  ;

// routes for admin users to create new categories
// router.get('/admin/add-category', (req,res,next)=>{
router.get('/add-category', (req,res,next)=>{
  res.render('admin/add-category', {
    user: req.user,
    app: res.app.locals.app,
    title: "Add a new product category.",
    successes: req.flash('success'),
    errors: req.flash('error')
  });
});

// router.post('/admin/add-category', (req,res,next)=>{
router.post('/add-category', (req,res,next)=>{
  let category = new Category();
  category.name = req.body.name;
  category.save((err, done)=>{
    if(err) return done(err);
    req.flash('success', `New category (${this.name}) added.`);
    return res.redirect('/admin/add-category');
  });
});



module.exports = router;
