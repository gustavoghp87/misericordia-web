const path = require('path');
const express = require('express');
const morgan = require('morgan');
const flash = require('connect-flash');


// initializations
const app = express();
require('./controllers/database');
require('./controllers/local-auth');


// settings
app.set('port', process.env.PORT || 8005);
app.set('views', path.join(__dirname, 'views'));
module.exports = app;
const hbsController = require('./controllers/handlebars');
app.engine('.hbs', hbsController(app));
app.set('view engine', '.hbs');

// middlewares
app.use(morgan('dev'));
app.use(express.json());

const sessionSecret = require('./env.json').sessionSecret;
const passport = require('passport');
const session = require('express-session');
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

app.use(express.urlencoded({extended: false}))

//static files
app.use(express.static(__dirname + '/frontend-src'));

// routes
app.use(require('./routes/index.routes'));

const server = app.listen(app.get('port'), () => {
  console.log(`server on port ${app.get('port')}`);
});

module.exports = server;

require('./routes/sockets');

///////////////////////////////////////////////////////////////////////////////////
