const path = require('path');
const express = require('express');
const morgan = require('morgan');
const exphbs = require('express-handlebars');
const Handlebars = require('handlebars');
const { allowInsecurePrototypeAccess } = require('@handlebars/allow-prototype-access');
const flash = require('connect-flash');


// initializations
const app = express();
require('./database');
require('./passport/local-auth');


// settings
app.set('port', process.env.PORT || 8005);
app.set('views', path.join(__dirname, 'views'));

app.engine('.hbs', exphbs({
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
}));

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
app.use(flash());              //entre sesión y passport
app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
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



///////////////////////////////////////////////////////////////////////////////////

const SocketIO = require('socket.io');
const Vivienda = require('./model/Vivienda');
const User = require('./model/User');
const io = SocketIO(server);


io.on('connection', async (socket) => {
  console.log('new connection', socket.id);

  socket.on('vivienda:cambio', async (data) => {
    console.log("Recibido en servidor,", data);
    
    let cambios = {
      observaciones: data.observaciones,
      estado: data.estado,
      observaciones: data.observaciones,
      fechaUlt: data.timestamp,
      noAbonado: data.noAbonado
    };

    let cambios2 = {
      inner_id: data.vivienda,
      observaciones: data.observaciones,
      estado: data.estado,
      observaciones: data.observaciones,
      fechaUlt: data.timestamp,
      noAbonado: data.noAbonado
    };

    await Vivienda.updateOne({inner_id: data.vivienda}, {$set: cambios});

    await User.updateOne({email: data.email}, {$push: {actividad: cambios2}});

    io.sockets.emit('vivienda:cambio', data);
  });


  socket.on('estadisticas:globales', async (data) => {
    //console.log("Recibido", data)
    let i = data.terr;

    const cant = (await Vivienda.find({territorio:i.toString()})).length;
    const noAbon = (await Vivienda.find({$and:[{territorio:i.toString()},{noAbonado:true}]})).length;
    const noLlamar = (await Vivienda.find({$and:[{territorio:i.toString()},{estado:"No llamar"}]})).length;
    const noPred = (await Vivienda.find({$and:[{territorio:i.toString()},{estado:"No predicado"}]})).length;
    const noContesto = (await Vivienda.find({$and:[{territorio:i.toString()},{estado:"No contestó"}]})).length;
    const limpio = noPred + noContesto;
    const limpioPC = (100*limpio/cant).toFixed(1)
    const revisita = (await Vivienda.find({$and:[{territorio:i.toString()},{estado:"Revisita"}]})).length;
    const contestaron = (await Vivienda.find({$and:[{territorio:i.toString()},{estado:'Contestó'}]})).length;
    const contestador = (await Vivienda.find({$and:[{territorio:i.toString()},{estado:'Msj en contestador'}]})).length;
    const cantCartas = (await Vivienda.find({$and:[{territorio:i.toString()},{estado:'A dejar carta'}]})).length;

    const terri = {
      cant,
      noAbon,
      noLlamar,
      noPred,
      noContesto,
      limpio,
      limpioPC,
      revisita,
      contestaron,
      contestador,
      cantCartas,
      nextTerr: i + 1
    }
    socket.emit('estadisticas:globales', terri)
  })

});






// let territorios = [];

// for (i=1; i<=56; i++) {
//   let cant = (await Vivienda.find({territorio:i.toString()})).length;
//   let noAbon = (await Vivienda.find({$and:[{territorio:i.toString()},{noAbonado:true}]})).length;
//   let noLlamar = (await Vivienda.find({$and:[{territorio:i.toString()},{estado:"No llamar"}]})).length;
//   let noPred = (await Vivienda.find({$and:[{territorio:i.toString()},{estado:"No predicado"}]})).length;
//   let noContesto = (await Vivienda.find({$and:[{territorio:i.toString()},{estado:"No contestó"}]})).length;
//   let limpio = noPred + noContesto;
//   let limpioPC = (100*limpio/cant).toFixed(1)
//   let revisita = (await Vivienda.find({$and:[{territorio:i.toString()},{estado:"Revisita"}]})).length;
//   const contestaron = (await Vivienda.find({$and:[{territorio:i.toString()},{estado:'Contestó'}]})).length;
//   const contestador = (await Vivienda.find({$and:[{territorio:i.toString()},{estado:'Msj en contestador'}]})).length;
//   const cantCartas = (await Vivienda.find({$and:[{territorio:i.toString()},{estado:'A dejar carta'}]})).length;

//   let terri = {
//     cant,
//     noAbon,
//     noLlamar,
//     noPred,
//     noContesto,
//     limpio,
//     limpioPC,
//     revisita,
//     contestaron,
//     contestador,
//     cantCartas
//   }

//   territorios.push(terri);
// }
