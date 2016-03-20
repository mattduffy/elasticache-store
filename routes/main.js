'use strict';
const router = require('express').Router()
  , Category = require('../models/category')
  , Product = require('../models/product')
  , Cart = require('../models/cart')
  , cfg = require('../config')
  , stripe = require('stripe')(cfg.StripeTestSecretKey)
  , async = require('async')
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

var paginate = (req,res,next)=>{
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
        pages: num / perPage,
        page: page
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
    }, {hydrate: true, hydrateOptions: {lean: false}}, (err, result)=>{
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
      //user: res.local.user,
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

router.get('/product/:_id', (req,res,next)=>{
  Product.findOne({_id: req.params._id}, (err, product)=>{
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

router.post('/product/:product_id',(req,res,next)=>{
  let c = Cart
    .findOne({owner: req.user._id})
    .populate('items.item');
    c.exec((err, foundCart)=>{
      if(err) return next(err);
      let item = {
        item: req.body.product_id,
        price: parseFloat(req.body.priceValue),
        quantity: parseInt(req.body.quantity)
      };
      foundCart.items.push(item);
      foundCart.total = (foundCart.total + parseFloat(req.body.priceValue)).toFixed(2);
      foundCart.save((err)=>{
        if(err) return next(err);
        return res.redirect('/cart');
      });
    });
});

router.get('/cart', (req,res,next)=>{
  let c = Cart
  .findOne({owner: req.user._id})
  .populate('items.item');
  c.exec((err, foundCart)=>{
    if(err) return next(err);
    res.render('main/cart', {
      foundCart: foundCart,
      title: "Your Clonie shopping cart",
      errors: req.flash('error'),
      messages: req.flash('message'),
      successes: req.flash('success')
    });
  });
});

router.post('/remove', (req,res,next)=>{
  Cart.findOne({owner: req.user._id}, (err, foundCart)=>{
    if(err) return next(err);
    foundCart.items.pull(String(req.body.item));
    foundCart.total = (foundCart.total - parseFloat(req.body.price)).toFixed(2);
    foundCart.save((err)=>{
      if(err) return next(err);
      req.flash('success', "Removed item from cart");
      res.redirect('/cart');
    });
  });
});

router.post('/payment',(req,res,next)=>{
  console.log(req.body);
  let stripeToken = req.body.stripeToken;
  let currentCharges = Math.round(req.body.stripeMoney *100);
  stripe.customers.create({
    source: stripeToken
  }).then((customer)=>{
    return stripe.charges.create({
      customer: customer.id,
      currency: 'usd',
      amount: currentCharges
    });
  }).then((charge)=>{
    async.waterfall([
      (callback)=>{
        req.flash('message', "You done boughtenatron'd da stuff.");
      },
      (callback)=>{},
      (callback)=>{}
    ])
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
