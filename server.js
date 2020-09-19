const path = require('path');
const express = require('express');
const morgan = require('morgan');

// initializations
const app = express();
require('./controllers/database');
require('./controllers/local-auth');

// settings
app.set('port', process.env.PORT || 8005);
app.set('views', path.join(__dirname, 'views'));
const hbsController = require('./controllers/handlebars');
app.engine('.hbs', hbsController(app));
app.set('view engine', '.hbs');

// middlewares
app.use(morgan('dev'));
app.use(express.json());
const sessionAndFlash = require('./controllers/sessionAndFlash');
sessionAndFlash(app);
app.use(express.urlencoded({extended: false}));

//static files
app.use(express.static(path.join(__dirname, 'frontend-src')));

// routes
app.use(require('./routes/index.routes'));

const server = app.listen(app.get('port'), () => {
  console.log(`server on port ${app.get('port')}`);
});

module.exports = server;
require('./routes/sockets');
