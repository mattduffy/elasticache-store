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

function paginate(req,res,next){
  let perPage = 9;
  let page = req.params.page || 1;
  let p = Product
    .find()
    .skip(perPage * page)
    .limit(perPage)
    .populate('category');
  p.exec((err, products)=>{
    if(err) return next(err);
    Product.count().exec((err, num)=>{
      if(err) return next(err);
      res.render('main/product-main', {
        title: "Clonie stuff",
        products: products,
        pages: num / perPage
      });
    });
  });
}

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

router.post('/search',(req,res,next)=>{
  res.redirect('/search?q='+req.body.q);
});

router.get('/search',(req,res,next)=>{
  if(req.query.q){
    Product.search({
      query_string: {query: req.query.q}
    },(err, result)=>{
      if(err) return next(err);
      var data = result.hits.hits.map((hit)=>{
        return hit;
      });
      res.render('main/search-result', {
        title: "Search Results",
        query: req.query.q,
        data: data
      });
    });
  }
});

router.get('/', (req, res, next)=>{
  let app = res.app.locals.app;
  if(req.user){
    paginate(req,res,next);
  } else {
    res.render('main/home', {
      title: 'Clonie and me',
      app: app,
      profile: req.flash('profile')
    });
  }
});

router.get('/page/:page', (req, res, next)=>{
  let app = res.app.locals.app;
  paginate(req,res,next);
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
