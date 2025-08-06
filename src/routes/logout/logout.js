var express = require('express');
const router = express.Router()
const login= require('../login/login')

router.get("/logout", function(req, res, next) {
    req.logout(function(err) {
        if (err) {
            return next(err);
        }
        res.redirect("/login");
    });
});

module.exports = router