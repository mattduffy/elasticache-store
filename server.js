'use strict';
const express = require('express')
  , app = express()
  , bodyParser = require('body-parser')
  , port = process.env.PORT || 3000
  , morgan = require('morgan')
  , mongoose = require('mongoose')
  , cfg = require('./config')
  ;


mongoose.connect(cfg.DBUrl2, (err)=>{
  if(err){
    console.log(err);
  } else {
    console.info("connected to the database.");
  }
});

const User = require('./models/user.js');


// middle wares
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// routes
app.get('/', (req, res, next)=>{
  res.json("froggy froggy froggy");
});

app.post('/create-user', (req, res, next)=>{
  let user = new User();
  user.profile.name = req.body.name;
  user.password = req.body.password;
  user.email = req.body.email;
  user.save((err)=>{
    if(err) {
      next(err);
    } else {
      console.log(this);
      res.json("successfully added a new user");
    }
  });
});

app.post('/login', (req, res, next)=>{
  let password = req.body.password;
  let id = req.body.id;
  console.log(req.body);
  // let id = new mongoose.Types.ObjectId(req.body.id);
  // let id = '56da4a075aedff11db08c157' // db.users
  // let id = '56dc9413033b51aff34b9982' // db.User
  //User.findOne({id: id}, (err, result)=>{
  User.findById(id, (err, result)=>{
    if(err){
      console.log("db error occurred" );
      res.json({err: '404', msg:'DB error: ', err});
    } else {
      let user = new User(result);
      console.log("user found: ", user);
      if(user.comparePassword(password)){
        res.json(result);
      } else {
        res.json({'msg': "nice try bucko."});
      }
    }
  });
});

// server app config
app.listen(port, (err)=>{
  if(err) throw err;
  console.log("app is running on ", port);
});
