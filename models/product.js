'use strict';
const mongoose = require('mongoose')
  , Schema = mongoose.Schema
  ;

var ProductSchema = new Schema({
  category: {type: Schema.types.ObjectId, ref: 'Category'},
  name: String,
  price: Number,
  image: String
});

module.exports = mongoose.model('Product', ProductSchema, {collection: 'Product'});
