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
      type: Array
  }]
});

AsignaturasSchema.methods.findAll = async function () {
  const Asignatura = mongoose.model("Asignaturas", AsignaturasSchema);
  return await Asignatura.find()
    .then(result => {return result})
    .catch(error => console.log("q"+error));
};

AsignaturasSchema.methods.insert = async function () {
  await this.save()
  .then(result => console.log(result))
  .catch(error => console.log(error));
};

AsignaturasSchema.methods.update = async (id, asignatura) => {
  const Asignatura = mongoose.model("Asignaturas", AsignaturasSchema);
  await Asignatura.updateOne({_id: id}, asignatura)
    .then(() => console.log(id + " updated"))
    .catch(error => console.log(error));
};

AsignaturasSchema.methods.delete = async function (id) {
  const Asignatura = mongoose.model("Asignaturas", AsignaturasSchema);
  await Asignatura.deleteOne({_id: id})
    .then(() => console.log(id + " deleted"))
    .catch(error => console.log(error));
};

AsignaturasSchema.methods.findById = async function (id) {
  const Asignatura = mongoose.model("Asignaturas", AsignaturasSchema);
  return await Asignatura.findById(id)
    .then(result => { return result} )
    .catch(error => console.log(error));
};

AsignaturasSchema.methods.findSearch = async function (search, usuario) {
  const Asignatura = mongoose.model("Asignaturas", AsignaturasSchema);
  return await Asignatura.find({'nombre' : new RegExp(search, 'i'),'usuario': usuario})
    .then(result => { return result})
    .catch(error => console.log(error));
};

//UNO DE LOS 2 DEBERIA ESTAR BIEN, HAY QUE QUEDARSE SOLO CON 1 METODO DE BUSCAR SOFTWARE
AsignaturasSchema.methods.insert = async function(software) {
  // Añade el software a la asignatura
  this.software.push(software);

  // Guarda la asignatura
  await this.save()
  .then(result => console.log(result))
  .catch(error => console.log(error));
};

//Nuevo para sofware:
AsignaturasSchema.methods.insertSoftware = async function(software, userId) {
  //Añado el software a la asignatura
  this.software.push({
    url: software.url,
    descripcion: software.descripcion,
    addedBy: userId
  });

  //Guardo la asignatura
  await this.save()
  .then(result => console.log(result))
  .catch(error => console.log(error));
};

module.exports = mongoose.model('Asignaturas', AsignaturasSchema);
