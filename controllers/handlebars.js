const exphbs = require('express-handlebars');
const Handlebars = require('handlebars');
const { allowInsecurePrototypeAccess } = require('@handlebars/allow-prototype-access');
const path = require('path');
const app = require('../server');

const hbsController = (app) => exphbs({
    defaultLayout: 'main',
    layoutsDir: path.join(app.get('views'), 'layouts'),
    partialsDir: path.join(app.get('views'), 'partials'),
    extname: '.hbs',
    handlebars: allowInsecurePrototypeAccess(Handlebars),
    helpers:{
      // Function to do basic mathematical operation in handlebar
      math: function(lvalue, operator, rvalue) {lvalue = parseFloat(lvalue);
          rvalue = parseFloat(rvalue);
          return {
              "+": lvalue + rvalue,
              "-": lvalue - rvalue,
              "*": lvalue * rvalue,
              "/": lvalue / rvalue,
              "%": lvalue % rvalue
          }[operator];
      },
      eachInMap: function ( map, block ) {
        var out = '';
        Object.keys( map ).map(function( prop ) {
          out += block.fn( {key: prop, value: map[ prop ]} );
        });
        return out;
      }
    }
});

module.exports = hbsController;