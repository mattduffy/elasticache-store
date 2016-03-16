'use strict';
const router = require('express').Router()
  , async = require('async')
  , faker = require('faker')
  , mongoose = require('mongoose')
  , Category = require('../models/category')
  , Product = require('../models/product')
  ;

router.get('/:name', (req,res,next)=>{
  async.waterfall([
    (callback)=>{
      Category.findOne({name: req.params.name}, (err, category)=>{
        if(err) return next(err);
        callback(null, category);
      });
    },
    (category, callback)=>{
      for(var i=0; i<30; i++){
        var product = new Product();
        product.category = new mongoose.Types.ObjectId(category._id);
        product.name = faker.commerce.productName();
        product.price = faker.commerce.price();
        product.image = faker.image.image();
        product.save();
      }
    }
  ]);
  res.json({message: "success"});
});

module.exports = router;
