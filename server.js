'use strict';
const express = require('express')
  , app = express()
  , bodyParser = require('body-parser')
  , port = process.env.PORT || 3000
  , morgan = require('morgan')
  , mongoose = require('mongoose')
  , cfg = require('./config')
  , User = require('./models/user.js')
  ;


mongoose.connect(cfg.DBUrl2, (err)=>{
  if(err){
    console.log(err);
  } else {
    console.info("connected to the database.");
  }
});
// middle wares
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// routes
app.get('/', (req, res, next)=>{
  res.json("faggot faggot faggot");
});

app.post('/create-user', (req, res, next)=>{
  let user = new User();
  user.profile.name = req.body.name;
  user.password = req.body.password;
  user.email = req.body.email;
  user.save((err)=>{
    if(err) next(err);
    res.json("successfully added a new user");
  });
});

// server app config
app.listen(port, (err)=>{
  if(err) throw err;
  console.log("app is running on ", port);
});
