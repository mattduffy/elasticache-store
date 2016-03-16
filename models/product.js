'use strict';
const mongoose = require('mongoose')
  , Schema = mongoose.Schema
  , mongoosastic = require('mongoosastic')
  , cfg = require('../config/')
  ;

var ProductSchema = new Schema({
  category: {type: Schema.Types.ObjectId, ref: 'Category'},
  name: String,
  price: Number,
  image: String
}, {collection: 'Product'});

ProductSchema.plugin(mongoosastic, {
  hosts: [
    cfg.ESUrl
  ]
});

module.exports = mongoose.model('Product', ProductSchema);
