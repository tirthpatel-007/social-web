require('dotenv').config();
require('./bin/www')
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
// const port = 2000

// Connect to the database
const connectDB = require('./config/db');
connectDB();

// Require Routers
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var postRouter = require('./routes/post');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Setup Middleware
app.use(flash());
app.use(session({
  resave: false,
  saveUninitialized: false,
  secret: process.env.SESSION_SECRET || "a default secret for local dev"
}));

app.use(passport.initialize());
app.use(passport.session());

// --- THIS IS THE FIX ---
// We pass the functions directly, without calling them with ()
passport.serializeUser(usersRouter.serializeUser);
passport.deserializeUser(usersRouter.deserializeUser);
// --- END OF FIX ---

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Use Routers
app.use('/', indexRouter);
app.use('/users', usersRouter.router);
app.use('/post', postRouter);

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

// app.listen(port, () => {
//   console.log(`Example app listening on port ${port}`)
// })


module.exports = app;