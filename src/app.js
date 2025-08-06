const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');

// Require Routers from the new location
const indexRouter = require('./routes/index');

const app = express();

// View engine setup - point to the new views directory
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

// We will set up passport strategies in a separate config file later if needed
// For now, let's keep it simple. The logic will be in the routes/controllers.

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Serve static files from the root `public` folder
app.use(express.static(path.join(__dirname, '../public')));

// Use Routers
app.use('/', indexRouter);


// This file should NOT start the server.
// It should only configure and export the app.
module.exports = app;