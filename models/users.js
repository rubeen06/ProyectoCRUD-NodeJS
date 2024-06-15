const mongoose = require('mongoose');
const bcrypt = require('bcrypt-nodejs');

const { Schema } = mongoose;

const userSchema = new Schema({
  nombre:  { type: String, required: true },
  apellidos:  { type: String, required: true },
  rol:  { type: String, required: true },
  email:  { type: String, required: true },
  password:  { type: String, required: true },
  asignaturas: [{
    type: mongoose.Schema.Types.ObjectId, ref:'asignaturas'
  }]
});

userSchema.methods.encryptPassword = (password) => {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(10));
};

userSchema.methods.comparePassword= function (password) {
  return bcrypt.compareSync(password, this.password);
};

userSchema.pre('save', function(next) {
  if (this.isModified('password') || this.isNew) {
    this.password = this.encryptPassword(this.password);
  }
  next();
});

userSchema.methods.findEmail= async (email) => {
  const User = mongoose.model("users", userSchema);
  return  await User.findOne({'email': email})
};

userSchema.methods.findAll = async function () {
  const User = mongoose.model("users", userSchema);
  return await User.find()
    .then(result => {return result})
    .catch(error => console.log("q"+error));
};

userSchema.methods.insert = async function () {
  await this.save()
  .then(result => console.log(result))
  .catch(error => console.log(error));
};

userSchema.methods.update = async (id, usuario) => {
  const User = mongoose.model("users", userSchema);
  await User.updateOne({_id: id}, usuario)
    .then(() => console.log(id + " updated"))
    .catch(error => console.log(error));
};

userSchema.methods.delete = async function (id) {
  const User = mongoose.model("users", userSchema);
  await User.deleteOne({_id: id})
    .then(() => console.log(id + " deleted"))
    .catch(error => console.log(error));
};

userSchema.methods.findById = async function (id) {
  const User = mongoose.model("users", userSchema);
  return await User.findById(id)
    .then(result => { return result} )
    .catch(error => console.log(error));
};

userSchema.methods.findSearch = async function (search) {
  const User = mongoose.model("users", userSchema);
  return await User.find({'nombre' : new RegExp(search, 'i'),'usuario': usuario})
    .then(result => { return result})
    .catch(error => console.log(error));
};

//para el tema sugerencias
userSchema.methods.findAdmins = async function () {
  const User = mongoose.model("users", userSchema);
  return await User.find({ rol: 'Administrador' });
};

module.exports = mongoose.model('users', userSchema);