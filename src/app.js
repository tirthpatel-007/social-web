var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const expressSession = require('express-session');
const passport = require('passport');
const flash = require('connect-flash');

// Import route files
var indexRouter = require('./routes/index');
var authRouter = require('./routes/auth');      // NEW
var usersRouter = require('./routes/user');    // NEW  
var postsRouter = require('./routes/post');    // NEW

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Session configuration
app.use(expressSession({
  resave: false,
  saveUninitialized: false,
  secret: process.env.SESSION_SECRET || "default_secret"
}));

// Passport configuration
app.use(passport.initialize());
app.use(passport.session());

// Flash messages
app.use(flash());

// Use routes
app.use('/', indexRouter);     // Main routes (home, feed)
app.use('/', authRouter);      // Auth routes (login, register, logout)
app.use('/', usersRouter);     // User routes (profile, upload)
app.use('/', postsRouter);     // Post routes (create, delete, view posts)

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;