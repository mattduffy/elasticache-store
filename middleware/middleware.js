'use strict';
const Cart = require('../models/cart.js')
  ;

module.exports = (req,res,next)=>{
  if(req.user){
    let total = 0;
    Cart.findOne({owner: req.user._id}, (err,cart)=>{
      if(cart) {
        for(var i=0; i<cart.items.length; i++){
          total += cart.items[i].quantity;
        }
        res.locals.cart = total;
      } else {
        let cart = new Cart();
        cart.owner = req.user._id;
        cart.save((err)=>{
          if(err) {
            req.flash('The universe does not want you to have a shopping cart.');
            return next(err);
          }
        });
        res.locals.cart = total;
      }
    });
    next();
  } else {
    req.flash('error', "You do not exist.");
    next();
  }
};
