const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AsignaturaSchema = Schema({
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



AsignaturaSchema.methods.findAll= async function (usuario) {
  const Asignatura  = mongoose.model("asignaturas", AsignaturaSchema);
  return await Asignatura.find({'usuario':usuario});
};

AsignaturaSchema.methods.insert= async function () {
  //await this.save();
  await this.save((err, res) => {
    err ? console.log(err) : "";
    console.log("saved: " + res);
  });
};

AsignaturaSchema.methods.update= async (id, task) => {
  const Asignatura = mongoose.model("asignaturas", AsignaturaSchema);
  await Asignatura.updateOne({_id: id}, task, err => {
    if (err) console.log(err);
  });
  console.log(id + " updated");
};

AsignaturaSchema.methods.delete= async function (id) {
  const Asignatura = mongoose.model("asignaturas", AsignaturaSchema);
  await Asignatura.deleteOne({_id: id}, err => {
    if (err) console.log(err);
  });
  console.log(id + " deleted");

};

AsignaturaSchema.methods.findById= async function (id) {
  const Asignatura = mongoose.model("asignaturas", AsignaturaSchema);
  return await Asignatura.findById(id);
};

AsignaturaSchema.methods.findSearch= async function (search, usuario) {
  const Asignatura = mongoose.model("asignaturas", AsignaturaSchema);
  return await Asignatura.find({'nombre' : new RegExp(search, 'i'),'usuario': usuario});
};


module.exports = mongoose.model('asignaturas', AsignaturaSchema);
