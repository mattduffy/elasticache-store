'use strict';
const express = require('express')
  , app = express()
  , bodyParser = require('body-parser')
  , port = process.env.PORT || 3000
  , morgan = require('morgan')
  , mongoose = require('mongoose')
  , cfg = require('./config')
  , ejs = require('ejs')
  // , engine = require('ejs-locals')
  , engine = require('ejs-mate')
  , session = require('express-session')
  , cookieParser = require('cookie-parser')
  , flash = require('express-flash')
  , MongoStore = require('connect-mongo')(session)
  , passport = require('passport')
  , Category = require('./models/category')
  ;


mongoose.connect(cfg.DBUrl2, (err)=>{
  if(err){
    console.log(err);
  } else {
    console.info("connected to the database.");
  }
});

const User = require('./models/user.js');


// 3rd party middlewares
app.use(express.static(__dirname +'/public'));
app.use(cookieParser());
app.use(session({
  resave: false,
  saveUninitialized: false,
  secret: "super secrete security stuff",
  store: new MongoStore({url: cfg.DBUrl2, autoReconnect: true})
}));
app.use(flash());
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.text({type: 'text/*'}));
app.use(bodyParser.urlencoded({extended: true}));
app.use(passport.initialize());
app.use(passport.session());

// my custom middlewares
app.use((req, res, next)=>{
  res.locals.user = (req.user) ? res.user : null;
  Category.find({}, (err, categories)=>{
    if(err) return next(err);
    res.locals.prod_categories = categories;
    console.log("middleware set res categories ", res.locals.categories);
  });
  next();
});
// app.use((req,res,next)=>{
//   Category.find({}, (err, categories)=>{
//     if(err) return next(err);
//     res.locals.categories = categories;
//     next();
//   })
//   next();
// });

// express app settings
app.engine('ejs', engine);
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.disable('x-powered-by');
app.locals.app = {name: "My Amazon clone"};

// routes
app.all('*', (req,res,next)=>{
  Category.find({}, (err, categories)=>{
    if(err) return next(err);
    res.locals.categories = categories;
    next();
  });
});
var mainRoutes = require('./routes/main');
app.use(mainRoutes);

var userRoutes = require('./routes/user');
app.use(userRoutes);

var adminRoutes = require('./routes/admin');
app.use('/admin', adminRoutes);

var apiRoutes = require('./api/api');
app.use('/api', apiRoutes);

// Keep this middleware function at the bottom of the list of routes/middleware
// to act as the fall through action for 404 - Not Found situations.
app.use(function(req, res, next) {
  res.status(404).send('Sorry cant find that!');
});

// server app config
app.listen(port, (err)=>{
  if(err) throw err;
  console.log("app is running on ", port);
});
