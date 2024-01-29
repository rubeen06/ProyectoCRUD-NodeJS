const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AsignaturasSchema = Schema({
  nombre: {
    type: String,
    required: true
  },
  planEstudios: {
    type: String,
    required: true
  },
  cuatrimestre: {
    type: Number,
    required: true
  },
  curso: {
    type: Number,
    required: true
  },
  software: [{
    type: String
  }]
});


AsignaturasSchema.methods.findAll= async function (usuario) {
  const Asignatura = mongoose.model("asignaturas", AsignaturasSchema);
  return await Asignatura.find({'usuario':usuario});
};

AsignaturasSchema.methods.insert= async function () {
  //await this.save();
  await this.save((err, res) => {
    err ? console.log(err) : "";
    console.log("saved: " + res);
  });
};

AsignaturasSchema.methods.update= async (id, task) => {
  const Asignatura = mongoose.model("asignaturas", AsignaturasSchema);
  await Asignatura.updateOne({_id: id}, task, err => {
    if (err) console.log(err);
  });
  console.log(id + " updated");
};

AsignaturasSchema.methods.delete= async function (id) {
  const Asignatura = mongoose.model("asignaturas", AsignaturasSchema);
  await Asignatura.deleteOne({_id: id}, err => {
    if (err) console.log(err);
  });
  console.log(id + " deleted");

};

AsignaturasSchema.methods.findById= async function (id) {
  const Asignatura = mongoose.model("asignaturas", AsignaturasSchema);
  return await Asignatura.findById(id);
};

AsignaturasSchema.methods.findSearch= async function (search, usuario) {
  const Asignatura = mongoose.model("asignaturas", AsignaturasSchema);
  return await Asignatura.find({'title' : new RegExp(search, 'i'),'usuario': usuario});
};


module.exports = mongoose.model('asignaturas', AsignaturasSchema);
