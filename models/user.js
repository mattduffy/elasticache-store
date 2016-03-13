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
  console.log(typeof password, ": ", password);
  console.log(typeof this.password), ": ", this.password;
  console.log(this);
  return bcrypt.compare(password, this.password || '', (err, result)=>{
    if(err) {
      console.log("bcrypt compare error: ", err, password);
      return false;
    } else {
      console.log("bcrypt compare: ", result);
      return result;
    }
  });
};

module.exports = mongoose.model('User', UserSchema, 'User'); // see commet above about schema compile bug in mongoose.
