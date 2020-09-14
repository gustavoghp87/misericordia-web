const sessionSecret = require('../env.json').sessionSecret;
const passport = require('passport');
const session = require('express-session');
const flash = require('connect-flash');

const sessionAndFlash = (app) => {
    app.use(session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false
    }));
    app.use(flash());              // ubicar entre sesión y passport
    app.use(passport.initialize());
    app.use(passport.session());

    app.use((req, _, next) => {
    app.locals.registerMessage = req.flash('registerMessage');
    app.locals.signinMessage = req.flash('signinMessage');
    app.locals.emailMessage = req.flash('emailMessage');
    app.locals.user = req.user;
    next();
    });
};

module.exports = sessionAndFlash;