const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ViviendaSchema = Schema({
  inner_id: {
    type: String,
    unique: true
  },
  cuadra_id: String,
  territorio: String,
  manzana: String,
  direccion: String,
  telefono: String,
  estado: String,
  observaciones: String,
  fechaUlt: String,
  noAbonado: {
    type: Boolean,
    default: false
  }
});

module.exports = mongoose.model('viviendas', ViviendaSchema);


// this is the schema / the model of JSON for mongo
