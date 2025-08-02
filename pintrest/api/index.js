const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('<h1>Hello from Vercel!</h1><p>API is working!</p>');
});

app.get('*', (req, res) => {
  res.status(404).send('<h1>404 - Route not found</h1><p>Path: ' + req.path + '</p>');
});

module.exports = app;