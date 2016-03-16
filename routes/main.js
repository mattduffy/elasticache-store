'use strict';
const router = require('express').Router()
  , Category = require('../models/category')
  , Product = require('../models/product')
  ;

Product.createMapping((err, mapping)=>{
  if(err) {
    console.log("error creating ES mapping");
    console.trace(err);
  } else {
    console.log("mapping created.");
    console.log(mapping);
  }
});

var stream = Product.synchronize();
var count = 0;
stream.on('data', ()=>{
  count++;
});
stream.on('close', ()=>{
  console.log("Indexed " + count + " documents.");
});
stream.on('error', (err)=>{
  console.log(err);
});

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

router.get('/products/:id', (req,res,next)=>{
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

router.get('/product/:id', (req,res,next)=>{
  Product.findById({_id: req.params.id}, (err, product)=>{
    if(err) return next(err);
    res.render('main/product', {
      product: product,
      title: "Clonie: " + product.name,
      errors: req.flash('error'),
      messages: req.flash('message'),
      successes: req.flash('success')
    });
  });
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
