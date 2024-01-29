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



TaskSchema.methods.findAll= async function (usuario) {
  const Task = mongoose.model("tasks", TaskSchema);
  return await Task.find({'usuario':usuario});
};

TaskSchema.methods.insert= async function () {
  //await this.save();
  await this.save((err, res) => {
    err ? console.log(err) : "";
    console.log("saved: " + res);
  });
};

TaskSchema.methods.update= async (id, task) => {
  const Task = mongoose.model("tasks", TaskSchema);
  await Task.updateOne({_id: id}, task, err => {
    if (err) console.log(err);
  });
  console.log(id + " updated");
};

TaskSchema.methods.delete= async function (id) {
  const Task = mongoose.model("tasks", TaskSchema);
  await Task.deleteOne({_id: id}, err => {
    if (err) console.log(err);
  });
  console.log(id + " deleted");

};

TaskSchema.methods.findById= async function (id) {
  const Task = mongoose.model("tasks", TaskSchema);
  return await Task.findById(id);
};

TaskSchema.methods.findSearch= async function (search, usuario) {
  const Task = mongoose.model("tasks", TaskSchema);
  return await Task.find({'title' : new RegExp(search, 'i'),'usuario': usuario});
};


module.exports = mongoose.model('asignaturas', AsignaturaSchema);
