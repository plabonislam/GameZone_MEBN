var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var expressHbs=require('express-handlebars');
var mongoose=require('mongoose');

var expressSession=require('express-session');
var MongoStore = require('connect-mongo')(expressSession);
var passport=require('passport');
 var flash=require('connect-flash');
 var expressValidator=require('express-validator');
 var userRoute=require('./routes/user');
var indexRouter = require('./routes/index');

var nodemailer = require('nodemailer');
var bcrypt = require('bcrypt-nodejs');

var async = require('async');
var crypto = require('crypto');
var app = express();

mongoose.connect('mongodb://localhost/shop', {useNewUrlParser: true});
require('./config/passport');
// view engine setup
app.engine('.hbs',expressHbs({ defaultLayout:'layout',extname:'.hbs'}));
app.set('view engine', '.hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(expressValidator());
app.use(cookieParser());
app.use(expressSession({ secret:'max',
saveUninitialized:false,
resave:false,
store: new MongoStore({ mongooseConnection: mongoose.connection }),
cookie:{maxAge:1000*180*60}
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, 'public')));

app.use(function(req, res, next) {
  res.locals.variable=req.isAuthenticated();
  res.locals.session=req.session;
  next();
});

app.get('/logout', function(req, res) {
   req.session.cart = null;
  req.logout();
  res.redirect('/');
});

app.use('/user',userRoute);
app.use('/', indexRouter);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
