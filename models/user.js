'use strict';
const mongoose = require('mongoose')
  , Schema = mongoose.Schema
, bcrypt = require('bcrypt-nodejs')
  , crypto = require('crypto')
  ;

/* The user schema attributes / characteristics / fields */
var UserSchema = new mongoose.Schema({
  email: {type: String, unique: true, lowercase: true},
  password: String,
  profile: {
    name: {type: String, default: ''},
    picture: {type: String, default: ''}
  },
  address: String,
  history: [{
    date: Date,
    paid: {type: Number, default: 0},
    item: {type: Schema.Types.ObjectId, ref: 'Product'}
  }]
}, {collection: 'User'});
/* strange bug in 4.x.x+ version of mongoose where it silently changes the
collection name from User to users when it compiles the schema.  Can force
mongoose to use the User collection by passing optional obj argument. */

/* Hash the password before we save it to the DB. */
UserSchema.pre('save', function(next){
  let user = this;
  if(!user.isModified('password')) return next();
  bcrypt.genSalt(10, function(err, salt){
    if(err) return next(err);
    bcrypt.hash(user.password, salt, null, function(err, hash){
      if(err) return next(err);
      user.password = hash;
      next();
    });
  });
});

/* Compare user submitted password with cryptographic hash stored in DB. */
UserSchema.methods.comparePassword = (password)=>{
  let same = null;
  try {
    same = bcrypt.compare(password, this.password);
  } catch (err) {
    same = err;
  }
  return same;
};

UserSchema.methods.gravatar = (size)=>{
  if(!size) this.size = 200;
  if(!this.email) return 'https://gravatar.com/avatar/?s=' + this.size + '&d=retro';
  var md4 = crypto.createHash('md5').update(this.email).digest('hex');
  return 'https://gravatar.com/avatar/' + md5 + '?s=' + this.size + '&d=retro';
};

module.exports = mongoose.model('User', UserSchema, 'User'); // see commet above about schema compile bug in mongoose.
