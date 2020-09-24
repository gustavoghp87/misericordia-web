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
      estado: data.estado,
      fechaUlt: data.timestamp,
      noAbonado: data.noAbonado
    };

    let cambios2 = {
      inner_id: data.vivienda,
      estado: data.estado,
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
    // const revisita = (await Vivienda.find({$and:[{territorio:i.toString()},{estado:"Revisita"}]})).length;
    const contestaron = (await Vivienda.find({$and:[{territorio:i.toString()},{estado:'Contestó'}]})).length;
    // const contestador = (await Vivienda.find({$and:[{territorio:i.toString()},{estado:'Msj en contestador'}]})).length;
    const cantCartas = (await Vivienda.find({$and:[{territorio:i.toString()},{estado:'A dejar carta'}]})).length;

    const terri = {
      cant,
      noAbon,
      noLlamar,
      noPred,
      noContesto,
      limpio,
      limpioPC,
      contestaron,
      cantCartas,
      nextTerr: i + 1
    }
    socket.emit('estadisticas:globales', terri);
  });

  socket.on('usuarios:activar', async (data) => {
    //console.log("DATA:", data)
    await User.updateOne({email:data.email}, {estado:"activado"}, (err, success) => {
      if (err) console.log(`Error al intentar activar a ${data.email}`, err);
      else {
        console.log("\n\nÉxito en activar:", data.email, success, "\n");
        socket.emit('usuarios:activar', {activado: data.email});
      };
    })
  });

  socket.on('usuarios:desactivar', async (data) => {
    //console.log("DATA:", data)
    await User.updateOne({email:data.email}, {estado:"desactivado"}, (err, success) => {
      if (err) console.log(`Error al intentar desactivar a ${data.email}`, err);
      else {
        console.log("\n\nÉxito en desactivar:", data.email, success, "\n");
        socket.emit('usuarios:desactivar', {desactivado: data.email});
      };
    });
  });

  socket.on('usuarios:hacerAdmin', async (data) => {
    //console.log("DATA:", data)
    await User.updateOne({email:data.email}, {role:1}, (err, success) => {
      if (err) console.log(`Error al intentar hacer administrador a ${data.email}`, err);
      else {
        console.log("\n\nÉxito en hacer administrador:", data.email, success, "\n");
        socket.emit('usuarios:hacerAdmin', {activado: data.email});
      };
    });
  });

  socket.on('usuarios:deshacerAdmin', async (data) => {
    //console.log("DATA:", data)
    await User.updateOne({email:data.email}, {role:0}, (err, success) => {
      if (err) console.log(`Error al intentar quitar de administrador a ${data.email}`, err);
      else {
        console.log("\n\nÉxito en quitar de administrador:", data.email, success, "\n");
        socket.emit('usuarios:deshacerAdmin', {desactivado: data.email});
      };
    })
  });

});
