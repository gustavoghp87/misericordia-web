const mongoose = require('mongoose');
//const Schema = mongoose.Schema;
const { Schema } = mongoose;
const bcrypt = require('bcrypt-nodejs');


const UserSchema = Schema({
  email: { type: String, lowercase: true },
  password: { type: String },
  group: { type: Number },
  role: { type: Number, default: 0 },
  estado: { type: String, default: 'desactivado' },
  actividad: {
    type: [],
    default: []
  }
});


UserSchema.methods.encryptPassword = (password) => {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(10));
};

UserSchema.methods.comparePassword = function(password) {
  return bcrypt.compareSync(password, this.password);
};

module.exports = mongoose.model('usuarios', UserSchema);
