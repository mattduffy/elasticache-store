'use strict';
const router = require('express').Router()
  , Category = require('../models/category')
  , Product = require('../models/product')
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

// router.get('/products/:_id', (req,res,next)=>{
//   Product
//   .find({category: req.params._id}, (err, products)=>{
//     if(err) return next(err);
//     res.render('main/category', {
//       title: "Category " + req.params._id,
//       products: products,
//       errors: req.flash('error'),
//       messages: req.flash('message'),
//       successes: req.flash('success')
//     });
//   });
// });
router.get('/products/:id', function(req,res,next){
  let p = Product
  .find({ category: req.params.id })
  .populate('category');
  p.exec((err, products)=>{
    if(err) return next(err);
    res.render('main/category', {
     title: "Category products",
      products: products,
      errors: req.flash('error'),
      messages: req.flash('message'),
      successes: req.flash('success')
    });
  })
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
