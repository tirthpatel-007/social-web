var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');

// --- 1. CONNECT TO THE DATABASE ---
const connectDB = require('./config/db');
connectDB();

// --- 2. REQUIRE ROUTERS ---
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var postRouter = require('./routes/post');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// --- 3. SETUP MIDDLEWARE ---
app.use(flash());
app.use(session({
  resave: false,
  saveUninitialized: false,
  secret: process.env.SESSION_SECRET
}));

// Passport setup
app.use(passport.initialize());
app.use(passport.session());
passport.serializeUser(usersRouter.serializeUser());
passport.deserializeUser(usersRouter.deserializeUser());

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


// --- 4. USE ROUTERS (THIS IS THE CORRECTED PART) ---
app.use('/', indexRouter);
app.use('/users', usersRouter.router); // FIX: Use usersRouter.router here
app.use('/post', postRouter);           // FIX: This line was missing


// --- 5. ERROR HANDLERS ---
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