const express = require('express');
const router = express.Router();
const Vivienda = require('../model/Vivienda');
const User = require('../model/User');
const Mayor = require('../model/Mayor');
const passport = require('passport');
const request = require('request');
const env = require('../env.json');


router.get('/', async (req, res) => {
  if (req.isAuthenticated())
    res.redirect('/territorios');
  else
    res.redirect('login');
});

router.get('/register', async (_, res) => {
  res.render('register');
});

router.post('/register', (req, res, next) => {
  try {
    const obj = JSON.parse(JSON.stringify(req.body));  
    const secretKey = env.secretKeyRecaptcha;
    const respon = obj['g-recaptcha-response'];
  
    const verifyURL = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${respon}&remoteip=${req.connection.remoteAddress}`;
  
    request(verifyURL, (err, response, body) => {
      if (err) {console.log(err); return res.json({"success": false, "msg": "Captcha no verificado"})};
      if (response) console.log(response);
      body = JSON.parse(body);
      //console.log(body);
      if (body.success != undefined && !body.success) {
        return res.json({"success": false, "msg": "Captcha no verificado"});
      } else {
        console.log("ok captcha")
        next();
      }
    });

  } catch(err) {console.log("Captch inválido,", err)}
});

router.post('/register', passport.authenticate('local-signup', {
  successRedirect: '/login',
  failureRedirect: '/register',
  passReqToCallback: true
}));

router.get('/login', async (_, res) => {
  res.render('login');
})

router.post('/login', (req, res, next) => {
  try {
    const obj = JSON.parse(JSON.stringify(req.body));  
    const secretKey = env.secretKeyRecaptcha;
    const respon = obj['g-recaptcha-response'];
    const verifyURL = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${respon}&remoteip=${req.connection.remoteAddress}`;
  
    request(verifyURL, (err, response, body) => {
      if (err) {console.log(err); return res.json({success: false, msg: "Captcha no verificado"})};
      if (response) console.log("");
      body = JSON.parse(body);
      //console.log(body);
  
      if (body.success != undefined && !body.success) {
        return res.json({"success": false, "msg": "Captcha no verificado"});
      } else {
        console.log(`Ok recaptcha reg ${req.body.email} - ${new Date()}`);
        next();
      }
    });

  } catch(err) {console.log("Captch inválido,", err)}
});

router.post('/login', passport.authenticate('local-signin', {
  successRedirect: '/territorios',
  failureRedirect: '/login',
  passReqToCallback: true
}));

router.get('/logout', (req, res, next) => {
  req.logOut();
  res.redirect('/');
})

router.get('/territorios', async (req, res, next) => {
  if (req.isAuthenticated())
    return next();
  res.redirect('/login');
});

router.get('/territorios', async (req, res) => {
  //console.log(req.user)
  let habilitados = []
  for (let i = 0; i < 56; i++) {
    habilitados.push({habilitados:i+1});
  }
  let json = {user: req.user.email, role: req.user.role}
  
  if (req.user.estado=="activado")
    res.render('index', {json, habilitados});
  else
    req.send("Usuario no autorizado")
});

router.get('/territorios/:terri/:manzana', async (req, res, next) => {
  if (req.isAuthenticated())
    return next();
  res.redirect('/login');
});

router.get('/territorios/:terri/:manzana', async (req, res) => {
  //console.log(req.params)
  let nu = req.params.terri;
  let manzana = req.params.manzana;

  const viviendas = await Vivienda.find({$and:[{'territorio':nu}, {'manzana':manzana}]}).sort({'calle':1});


  var busqManz6 = await Vivienda.findOne({$and: [{territorio:nu},{manzana:'6'}] });
  var busqManz5 = await Vivienda.findOne({$and: [{territorio:nu},{manzana:'5'}] });
  var busqManz4 = await Vivienda.findOne({$and: [{territorio:nu},{manzana:'4'}] });
  //console.log(busqManz6, busqManz5, busqManz4)
  var cantManzanas = '';
  if (busqManz6)
    cantManzanas = '6';
  else if (busqManz5)
    cantManzanas = '5';
  else if (busqManz4)
    cantManzanas = '4';
  else
    cantManzanas = '3';


  async function porCalle () {
    let calles_1 = []
    let calles_1_nom = []
    var primera = await Vivienda.findOne({$and: [{territorio:nu}, {manzana:'1'}] });
    try {
      let cuadra = primera.cuadra_id;
      calles_1.push(cuadra);
    
      for (i=0; i<5; i++) {
        let Cuadra = parseInt(cuadra) + i;
        let segundas = await Vivienda.findOne({$and: [{cuadra_id: Cuadra}, {manzana:'1'}] });
        cuadra_ = segundas.cuadra_id;
        if (calles_1.includes(cuadra_) === false) calles_1.push(cuadra_);
        cuadra_nom = segundas.direccion.slice(0, 7);
        if (calles_1_nom.includes(cuadra_nom) === false) calles_1_nom.push(cuadra_nom);
      }
    } catch(e) {} 

    console.log("array 1", calles_1)
    console.log("array 1", calles_1_nom)


    let calles_2 = []
    let calles_2_nom = []
    var primera = await Vivienda.findOne({$and: [{territorio:nu}, {manzana:'2'}] });
    try {
      let cuadra = primera.cuadra_id;
      calles_2.push(cuadra);
    
      for (i=0; i<5; i++) {
        let Cuadra = parseInt(cuadra) + i;
        let segundas = await Vivienda.findOne({$and: [{cuadra_id: Cuadra}, {manzana:'2'}] });
        cuadra_ = segundas.cuadra_id;
        if (calles_2.includes(cuadra_) === false) calles_2.push(cuadra_);
        cuadra_nom = segundas.direccion.slice(0, 7);
        if (calles_2_nom.includes(cuadra_nom) === false) calles_2_nom.push(cuadra_nom);
      }
    } catch(e) {} 

    console.log("array 2", calles_2)
    console.log("array 2", calles_2_nom)


    let calles_3 = []
    let calles_3_nom = []
    var primera = await Vivienda.findOne({$and: [{territorio:nu}, {manzana:'3'}] });
    try {
      let cuadra = primera.cuadra_id;
      calles_3.push(cuadra);
    
      for (i=0; i<5; i++) {
        let Cuadra = parseInt(cuadra) + i;
        let segundas = await Vivienda.findOne({$and: [{cuadra_id: Cuadra}, {manzana:'3'}] });
        cuadra_ = segundas.cuadra_id;
        if (calles_3.includes(cuadra_) === false) calles_3.push(cuadra_);
        cuadra_nom = segundas.direccion.slice(0, 7);
        if (calles_3_nom.includes(cuadra_nom) === false) calles_3_nom.push(cuadra_nom);
      }
    } catch(e) {} 

    console.log("array 3", calles_3)
    console.log("array 3", calles_3_nom)


    let calles_4 = []
    let calles_4_nom = []
    var primera = await Vivienda.findOne({$and: [{territorio:nu}, {manzana:'4'}] });
    try {
      let cuadra = primera.cuadra_id;
      calles_4.push(cuadra);
    
      for (i=0; i<5; i++) {
        let Cuadra = parseInt(cuadra) + i;
        let segundas = await Vivienda.findOne({$and: [{cuadra_id: Cuadra}, {manzana:'4'}] });
        cuadra_ = segundas.cuadra_id;
        if (calles_4.includes(cuadra_) === false) calles_4.push(cuadra_);
        cuadra_nom = segundas.direccion.slice(0, 7);
        if (calles_4_nom.includes(cuadra_nom) === false) calles_4_nom.push(cuadra_nom);
      }
    } catch(e) {} 

    console.log("array 4", calles_4)
    console.log("array 4", calles_4_nom)


    let calles_5 = []
    let calles_5_nom = []
    var primera = await Vivienda.findOne({$and: [{territorio:nu}, {manzana:'5'}] });
    try {
      let cuadra = primera.cuadra_id;
      calles_5.push(cuadra);
    
      for (i=0; i<5; i++) {
        let Cuadra = parseInt(cuadra) + i;
        let segundas = await Vivienda.findOne({$and: [{cuadra_id: Cuadra}, {manzana:'5'}] });
        cuadra_ = segundas.cuadra_id;
        if (calles_5.includes(cuadra_) === false) calles_5.push(cuadra_);
        cuadra_nom = segundas.direccion.slice(0, 7);
        if (calles_5_nom.includes(cuadra_nom) === false) calles_5_nom.push(cuadra_nom);
      }
    } catch(e) {} 

    console.log("array 5", calles_5)
    console.log("array 5", calles_5_nom)


    let calles_6 = []
    let calles_6_nom = []
    var primera = await Vivienda.findOne({$and: [{territorio:nu}, {manzana:'6'}] });
    try {
      let cuadra = primera.cuadra_id;
      calles_6.push(cuadra);
    
      for (i=0; i<5; i++) {
        let Cuadra = parseInt(cuadra) + i;
        let segundas = await Vivienda.findOne({$and: [{cuadra_id: Cuadra}, {manzana:'6'}] });
        cuadra_ = segundas.cuadra_id;
        if (calles_6.includes(cuadra_) === false) calles_6.push(cuadra_);
        cuadra_nom = segundas.direccion.slice(0, 7);
        if (calles_6_nom.includes(cuadra_nom) === false) calles_6_nom.push(cuadra_nom);
      }
    } catch(e) {}

    console.log("array 6", calles_6)
    console.log("array 6", calles_6_nom)

  };

  
  let json = {
    numero: nu,
    manzana,
    user: req.user.email,
    role: req.user.role,
    cantManzanas,
    ver:'todos'
  }

  res.render('territorios', {viviendas, json});
});

router.get('/territorios/:terri/:manzana/nopred', async (req, res, next) => {
  if (req.isAuthenticated())
    return next();
  res.redirect('/login');
});

router.get('/territorios/:terri/:manzana/nopred', async (req, res) => {
  //console.log(req.params)
  let nu = req.params.terri;
  let manzana = req.params.manzana;
  
  const viviendas = await Vivienda.find(
    {$and:[
      {$and:[{territorio:nu}, {manzana}]},
      {$or: [{estado:'No predicado'}, {estado:'No contestó'}, {estado:'No abonado en serv'}]}
    ]}).sort({'calle':1});

  var busqManz6 = await Vivienda.findOne({$and: [{territorio:nu},{manzana:'6'}] });
  var busqManz5 = await Vivienda.findOne({$and: [{territorio:nu},{manzana:'5'}] });
  var busqManz4 = await Vivienda.findOne({$and: [{territorio:nu},{manzana:'4'}] });
  //console.log(busqManz6, busqManz5, busqManz4)
  
  var cantManzanas = '';
  if (busqManz6)
    cantManzanas = '6';
  else if (busqManz5)
    cantManzanas = '5';
  else if (busqManz4)
    cantManzanas = '4';
  else
    cantManzanas = '3';

  //console.log(req.user.email)

  let json = {
    numero: nu,
    manzana: manzana,
    user: req.user.email,
    role: req.user.role,
    cantManzanas: cantManzanas,
    ver:'no predicados'
  }

  console.log("ok")
  res.render('territorios', {viviendas, json});
});

router.get('/estadisticas', async (req, res, next) => {
  if (req.isAuthenticated())
    return next();
  res.redirect('/login');
});

router.get('/estadisticas', async (req, res) => {

  const cantGlob = await Vivienda.find().countDocuments();
  const cantNoabonGlob = await Vivienda.find({noAbonado:true}).countDocuments();
  const cantReviGlob = await Vivienda.find({estado:'Revisita'}).countDocuments();
  const cantNollamarGlob = await Vivienda.find({estado:'No llamar'}).countDocuments();
  const contestaronGlob = await Vivienda.find({estado:'Contestó'}).countDocuments();
  const contestadorGlob = await Vivienda.find({estado:'Msj en contestador'}).countDocuments();
  const cantCartasGlob = await Vivienda.find({estado:'A dejar carta'}).countDocuments();
  const noContestoGlob = await Vivienda.find({estado:'No contestó'}).countDocuments();
  const noPredGlob = await Vivienda.find({estado:'No predicado'}).countDocuments();
  const quedanGlob = noContestoGlob + noPredGlob;
  let porcNopredGlob = (quedanGlob/cantGlob*100).toFixed(1);



//  console.log(territorios)

  let json = {
    user: req.user.email,
    role: req.user.role,
    cantGlob,
    cantReviGlob,
    cantNollamarGlob,
    cantNoabonGlob,
    porcNopredGlob,
    contestaronGlob,
    contestadorGlob,
    cantCartasGlob,
    noContestoGlob,
    noPredGlob,
    quedanGlob,
    cantGlob,
    numero: 'COMPLETO'
  };

  res.render('estadisticas', {json});

});

router.get('/estadisticas/:terri', async (req, res, next) => {
  if (req.isAuthenticated())
    return next();
  res.redirect('/login');
});

router.get('/estadisticas/:terri', async (req, res) => {
  let numero = req.params.terri;
  var busqManz6 = await Vivienda.findOne({$and: [{territorio:numero},{manzana:'6'}] });
  var busqManz5 = await Vivienda.findOne({$and: [{territorio:numero},{manzana:'5'}] });
  var busqManz4 = await Vivienda.findOne({$and: [{territorio:numero},{manzana:'4'}] });
  var cantManzanas = '';
  if (busqManz6)
    cantManzanas = '6';
  else if (busqManz5)
    cantManzanas = '5';
  else if (busqManz4)
    cantManzanas = '4';
  else
    cantManzanas = '3';

  //console.log(req.user.email)

  const cantidad = await Vivienda.find({territorio:numero}).countDocuments()
  const cantNoabon = await Vivienda.find({$and:[{territorio:numero}, {noAbonado:true}]}).countDocuments();
  const cantRevi = await Vivienda.find({$and:[{territorio:numero}, {estado:'Revisita'}]}).countDocuments();
  const cantNollamar = await Vivienda.find({$and:[{territorio:numero}, {estado:'No llamar'}]}).countDocuments();
  const cantNopred = await Vivienda.find({$and:[{territorio:numero}, {estado:'No predicado'}]}).countDocuments();
  const cantNoContest = await Vivienda.find({$and:[{territorio:numero}, {estado:'No contestó'}]}).countDocuments();
  const cantContestaron = await Vivienda.find({$and:[{territorio:numero}, {estado:'Contestó'}]}).countDocuments();
  const cantContestador = await Vivienda.find({$and:[{territorio:numero}, {estado:'Msj en contestador'}]}).countDocuments();
  const cantCartas = await Vivienda.find({$and:[{territorio:numero}, {estado:'A dejar carta'}]}).countDocuments();
  const cantNoPredTotal = cantNopred + cantNoContest;

  let porcNopred = ( (cantNoPredTotal/cantidad)*100 ).toFixed(1);
  //console.log(porcNopred);

  let json = {
    user: req.user.email,
    role: req.user.role,
    numero,
    cantManzanas,
    cantidad,
    cantRevi,
    cantNollamar,
    cantNopred,
    cantNoPredTotal,
    cantNoabon,
    porcNopred,
    cantContestaron,
    cantContestador,   
    cantCartas
  };

  res.render('estadisticas', {json});
});

router.post('/agregarVivienda', async (req, res, next) => {
  if (req.isAuthenticated() && req.user.role==1)
    return next();
  res.redirect('/login');
});

router.post('/agregarVivienda', async (req, res) => {

  let elMayor = (await Mayor.findOne()).elMayor;
  console.log("El mayor hasta ahora,", elMayor)
  let inner_id = (elMayor+1).toString()
  console.log(inner_id)

  console.log("Llegó:", req.body);

  let { direccion, telefono, estado, territorio, manzana, cuadra_id, observaciones, fechaUlt } = req.body;
  console.log(direccion, telefono, estado, territorio, manzana, cuadra_id, observaciones, fechaUlt)

  let nuevaVivienda = {inner_id, direccion, telefono, estado, territorio, manzana, cuadra_id, observaciones, fechaUlt};

  await Vivienda.create(nuevaVivienda);
  await User.updateOne({email:req.user.email}, {$push: {actividad:nuevaVivienda}});
  await Mayor.updateOne({elMayor}, {$set: {elMayor: elMayor+1}} );


  res.status(200).send("All right");
});

router.get('/revisitas', async (req, res, next) => {
  if (req.isAuthenticated())
    return next();
  res.redirect('/login');
});

router.get('/revisitas', async (req, res) => {
  const viviendas = await Vivienda.find({estado:"Revisita"});
  console.log(viviendas);

  let json = {
    user: req.user.email,
    role: req.user.role,
    viviendas,
    numero: "revisitas"
  }

  res.render('territorios', {viviendas, json});
});

router.get('*', (_, res) => {
  res.send("Sección no encontrada...");
});

module.exports = router;
