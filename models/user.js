'use strict';
const mongoose = require('mongoose')
  , bcrypt = require('bcrypt-nodejs')
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
    paid: {type: Number, default: 0}
    // item: {type: Schema.Types.ObjectId, ref: ''}
  }]
});


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
  return bcrypt.compare(password, this.password)
};

module.exports = mongoose.model('User', UserSchema);