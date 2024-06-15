const express = require('express');
const router = express.Router();
const Asignatura = require('../models/asignaturas');
const User = require('../models/users');
const nodemailer = require('nodemailer');
const fs = require('fs'); // filesystem
const csv = require('csv-parser');// Encargado de parsear
const path = require('path');
const result = [];

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // dirección de correo real
    pass: process.env.EMAIL_PASS
  }
});

router.get('/asignaturas', isAuthenticated, async (req, res) => {
  if (req.user.rol == "Administrador") {
    const asignatura = new Asignatura();
    const asignaturas = await asignatura.findAll();
    res.render('asignaturas', {
      asignaturas
    });
  } else {
    //Redirigo a los usuarios que no son administradores a /aulavirtual
    res.redirect('/aulavirtual');
  }
});


router.post('/asignaturas/add', isAuthenticated, async (req, res, next) => {
  const asignatura = new Asignatura(req.body);
  await asignatura.insert();
  res.redirect('/asignaturas');
});

router.post('/asignaturas/addAsignaturaCSV', async (req, res) => {
  try {
    const fileAsignaturas = req.files.file;
    fileAsignaturas.mv(`./files/asignaturas/${fileAsignaturas.name}`, async (err) => {
      if (err) {
        return res.status(500).send({ message: err });
      }
      result.length = 0;
      readCsvFile(`./files/asignaturas/${fileAsignaturas.name}`);
      res.redirect("/asignaturas");
    });
  } catch (error) {
    console.error('Error al procesar la solicitud:', error.message);
    res.status(500).send({ message: 'Error interno del servidor' });
  }
});

const readCsvFile = async (fileName) => {
  await fs.createReadStream(fileName)
    .pipe(csv({ separator: "," }))
    .on("data", (data) => result.push(data))
    .on("end", async () => {
      try {
        for (const asignatura of result) {
          if (asignatura.nombre && asignatura.planEstudios && asignatura.cuatrimestre && asignatura.curso) {
            const asig = new Asignatura();
            asig.nombre = asignatura.nombre;
            asig.planEstudios = asignatura.planEstudios;
            asig.cuatrimestre = asignatura.cuatrimestre;
            asig.curso = asignatura.curso;
            const softwares = asignatura.software.split(',');
            asig.software = softwares;
            await asig.save();
          } else {
            console.log(asignatura);
          }
        }
        console.log('Asignaturas guardadas correctamente.');
      } catch (error) {
        console.error('Error al guardar las asignaturas:', error.message);
      }
    });

};

router.get('/asignaturas/turn/:id', isAuthenticated, async (req, res, next) => {
  let { id } = req.params;
  const asignatura = await Asignatura.findById(id);
  asignatura.status = !asignatura.status;
  await asignatura.insert();
  res.redirect('/asignaturas');
});

router.get('/asignaturas/edit/:id', isAuthenticated, async (req, res, next) => {
  if (req.user.rol == "Administrador") {

    var asignatura = new Asignatura();
    asignatura = await asignatura.findById(req.params.id);
    res.render('edit', { asignatura });
    const alumnos = await User.find({ asignaturas: req.params.id, rol: 'Alumno' });

    // Enviar correo electrónico al alumno
    alumnos.forEach(alumno => {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: alumno.email,
        subject: 'Cambio en tu asignatura',
        text: 'Se ha editado la asignatura ' + asignatura.nombre + '. Por favor, revisa los cambios realizados.'
      };

      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log(error);
        } else {
          console.log('Correo enviado al alumno: ' + info.response);
        }
      });
    });
  } else {
    //Redirigo a los usuarios que no son administradores a /aulavirtual
    res.redirect('/aulavirtual');
  }
});

router.get('/asignaturas/edit', isAuthenticated, (req, res, next) => {
  //Redirigo al usuario que intente acceder sin una id
  res.redirect('/aulavirtual');
});


router.post('/asignaturas/edit/:id', isAuthenticated, async (req, res, next) => {
  const asignatura = new Asignatura();
  const { id } = req.params;
  await asignatura.update({ _id: id }, req.body);
  const alumno = await User.findOne({ asignaturas: req.params.id, rol: 'Alumno' });

  // Enviar correo electrónico al alumno
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: alumno.email,
    subject: 'Cambio en tu asignatura',
    text: `Se ha editado una asignatura que estás cursando. Por favor, revisa los cambios realizados.`
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log('Correo enviado al alumno: ' + info.response);
    }
  });
  res.redirect('/asignaturas');
});

router.get('/asignaturas/delete/:id', isAuthenticated, async (req, res, next) => {
  const asignatura = new Asignatura();
  let { id } = req.params;
  await asignatura.delete(id);
  res.redirect('/asignaturas');
  const alumnos = await User.find({ asignaturas: req.params.id, rol: 'Alumno' });
  // Enviar correo electrónico al alumno
  alumnos.forEach(alumno => {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: alumno.email,
      subject: 'Asignatura eliminada',
      text: 'Se ha eliminado una de las asignaturas que estabas cursando. Por favor, revisa los cambios realizados.'
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log('Correo enviado al alumno: ' + info.response);
      }
    });
  });
});

router.get('/asignaturas/search', isAuthenticated, async (req, res, next) => {
  if (req.user.rol == "Administrador") {
    const asignatura = new Asignatura();
    let search = req.query.search;
    const asignaturas = await asignatura.findSearch(search);
    res.render('asignaturas', {
      asignaturas
    });
  }
  else {
    res.redirect('/aulavirtual');
  }
});

router.get('/aulavirtual', isAuthenticated, async (req, res) => {
  const asignatura = new Asignatura();
  const asignaturas = await asignatura.findAll();
  res.render('aulavirtual', {
    asignaturas
  });
});

router.get('/aulavirtual/asigAula/:id', isAuthenticated, async (req, res, next) => {
  var asignatura = new Asignatura();
  asignatura = await asignatura.findById(req.params.id);
  res.render('asigAula', { asignatura });
});


router.post('/aulavirtual/asigAula/add/:id', isAuthenticated, async (req, res, next) => {
  let { id } = req.params;
  const asignatura = await Asignatura.findById(id);
  const software = req.body.software;
  asignatura.software.push(software);
  console.log(asignatura);
  await asignatura.update({ _id: id }, asignatura);
  const alumnos = await User.find({ asignaturas: req.params.id, rol: 'Alumno' });
  // Enviar correo electrónico al alumno
  alumnos.forEach(alumno => {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: alumno.email,
      subject: 'Cambio en tu asignatura',
      text: 'Se ha editado la asignatura ' + asignatura.nombre + '. Por favor, revisa los cambios realizados.'
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log('Correo enviado al alumno: ' + info.response);
      }
    });
  });
  res.redirect('/aulavirtual/asigAula/' + id);
});

//Guardo cualquier tipo de archivo en files/softwares
router.post('/aulavirtual/asigAula/add/upload/:id', async (req, res) => {
  try {
    const EDFile = req.files.file;
    const { id } = req.params;
    EDFile.mv(`./files/softwares/${EDFile.name}`, async (err) => {
      if (err) {
        return res.status(500).send({ message: err });
      } else {
        const asignatura = await Asignatura.findById(id);
        if (!asignatura) {
          return res.status(404).send({ message: 'Asignatura no encontrada' });
        }
        asignatura.software.push(`${EDFile.name}`);
        await asignatura.save();
        console.log('Software asociado a la asignatura correctamente.');
        const alumnos = await User.find({ asignaturas: req.params.id, rol: 'Alumno' });
        // Enviar correo electrónico al alumno
        alumnos.forEach(alumno => {
          const mailOptions = {
            from: process.env.EMAIL_USER,
            to: alumno.email,
            subject: 'Cambio en tu asignatura',
            text: 'Se ha editado la asignatura ' + asignatura.nombre + '. Por favor, revisa los cambios realizados.'
          };

          transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
              console.log(error);
            } else {
              console.log('Correo enviado al alumno: ' + info.response);
            }
          });
        });
        // Redirige al usuario a la nueva ruta
        res.redirect(`/aulavirtual/asigAula/${id}`);
      }
    });
  } catch (error) {
    console.error('Error al procesar la solicitud:', error.message);
    res.status(500).send({ message: 'Error interno del servidor' });
  }
});

router.get('/asigAula/download/:id/:software', isAuthenticated, async (req, res, next) => {
  try {
    const { software } = req.params;
    const filePath = path.join(__dirname, '..', 'files', 'softwares', software);

    res.download(filePath, (err) => {
      if (err) {
        console.error('Error al descargar el archivo:', err);
        return next(err);
      }
    });
  } catch (error) {
    console.error('Error al procesar la solicitud:', error);
    return res.status(500).send('Error interno del servidor');
  }
});



/*----------------------------------------------------------------------------------*/
//NUEVO PARA SOFTWARE, POR AHORA FALTA IMPLEMENTAR DEL TODO:
// Ruta para añadir software
router.post('/asigAula/add/:asignaturaId', isAuthenticated, async (req, res, next) => {
  const { asignaturaId } = req.params;
  const asignatura = await Asignatura.findById(asignaturaId);
  const software = req.body.software;
  asignatura.software.append(softwares);
  await asignatura.update({ _id: asignaturaId }, asignatura);

  res.redirect('/aulavirtual/asigAula/' + asignaturaId);
});

router.post('/aulavirtual/asigAula/delete/:id/:index', isAuthenticated, async (req, res, next) => {
  let { id, index } = req.params;
  const asignatura = await Asignatura.findById(id);
  asignatura.software.splice(index, 1);
  await asignatura.update({ _id: id }, asignatura);
  const alumnos = await User.find({ asignaturas: req.params.id, rol: 'Alumno' });
  // Enviar correo electrónico al alumno
  alumnos.forEach(alumno => {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: alumno.email,
      subject: 'Cambio en tu asignatura',
      text: 'Se ha editado la asignatura ' + asignatura.nombre + '. Por favor, revisa los cambios realizados.'
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log('Correo enviado al alumno: ' + info.response);
      }
    });
  });
  res.redirect('/aulavirtual/asigAula/' + id);
});


router.get('/aulavirtual/asigAula/edit/:id/:index', isAuthenticated, async (req, res, next) => {
  let { id, index } = req.params;
  const asignatura = await Asignatura.findById(id);
  const software = asignatura.software[index];
  res.render('editSoftware', { software, id, index });
});

router.post('/aulavirtual/asigAula/update/:id/:index', isAuthenticated, async (req, res, next) => {
  let { id, index } = req.params;
  const asignatura = await Asignatura.findById(id);
  asignatura.software[index] = req.body.software;
  await asignatura.update({ _id: id }, asignatura);
  res.redirect('/aulavirtual/asigAula/' + id);
});
/*
router.post('/aulavirtual/asigAula/edit/:id/:index', isAuthenticated, async (req, res, next) => {
  let { id, index } = req.params;
  const asignatura = await Asignatura.findById(id);
  asignatura.software[index] = req.body.software;
  await asignatura.update({_id: id}, asignatura);
  res.status(200).end();
});*/
/*
// Ruta para editar software
router.post('/asigAula/editSoftware/:asignaturaId/:softwareIndex', isAuthenticated, async (req, res, next) => {
  const { asignaturaId, softwareIndex } = req.params;
  const asignatura = await Asignatura.findById(asignaturaId);
  if (req.user._id.toString() === asignatura.software[softwareIndex].addedBy.toString() || req.user.rol === 'Administrador') {
    asignatura.software[softwareIndex] = req.body.software;
    await asignatura.save();
  }
  res.redirect('/asigAula/' + asignaturaId);
});

// Ruta para eliminar software
router.post('/asigAula/deleteSoftware/:asignaturaId/:softwareIndex', isAuthenticated, async (req, res, next) => {
  const { asignaturaId, softwareIndex } = req.params;
  const asignatura = await Asignatura.findById(asignaturaId);
  if (req.user._id.toString() === asignatura.software[softwareIndex].addedBy.toString() || req.user.rol === 'Administrador') {
    asignatura.software.splice(softwareIndex, 1);
    await asignatura.save();
  }
  res.redirect('/asigAula/' + asignaturaId);
});
/*----------------------------------------------------------------------------------------------------*/


function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/')
}

module.exports = router;