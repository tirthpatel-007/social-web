const dotenv = require('dotenv').config();
// Temporary test - remove after confirming it works
// console.log('Google Client ID:', process.env.GOOGLE_CLIENT_ID ? 'Loaded' : 'Not loaded');
// console.log('Google Client Secret:', process.env.GOOGLE_CLIENT_SECRET ? 'Loaded' : 'Not loaded');

var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const port = 2000
const host = '127.0.0.3'
var session = require('express-session')
const passport = require('passport')
const flash = require('connect-flash')
// 
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// Temporary test - remove after confirming it works
console.log('Google Client ID:', process.env.GOOGLE_CLIENT_ID ? 'Loaded' : 'Not loaded');
console.log('Google Client Secret:', process.env.GOOGLE_CLIENT_SECRET ? 'Loaded' : 'Not loaded');
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(session({
  resave: false,
  saveUninitialized: false,
  secret: "hohoho"
}))
app.use(flash());
app.use(passport.initialize())
app.use(passport.session())
passport.serializeUser(usersRouter.serializeUser())
passport.deserializeUser(usersRouter.deserializeUser())

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

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
app.listen(port, host, () => {
  console.log(`your server is running on ${host}:${port}`)
})

module.exports = app;
