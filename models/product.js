'use strict';
const mongoose = require('mongoose')
  , Schema = mongoose.Schema
  ;

var ProductSchema = new Schema({
  category: {type: Schema.Types.ObjectId, ref: 'Category'},
  name: String,
  price: Number,
  image: String
}, {collection: 'Product'});

module.exports = mongoose.model('Product', ProductSchema);
