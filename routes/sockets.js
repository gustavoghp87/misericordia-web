const SocketIO = require('socket.io');
const Vivienda = require('../model/Vivienda');
const User = require('../model/User');
const server = require('../server');
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

module.exports = io;