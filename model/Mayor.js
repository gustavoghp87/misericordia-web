const mongoose = require('mongoose');
const { Schema } = mongoose;


const MayorSchema = Schema({
  elMayor: {
    type: Number,
    default: 26000
  }
});



module.exports = mongoose.model('mayors', MayorSchema);
