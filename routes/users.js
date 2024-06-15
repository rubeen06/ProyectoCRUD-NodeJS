const router = require('express').Router();
const passport = require('passport');
const User = require('../models/users');
const Asignatura = require('../models/asignaturas');
const fs = require('fs'); // filesystem
const csv = require('csv-parser');// Encargado de parsear
const result=[];



router.get('/', (req, res, next) => {
  res.render('index');
});

router.get('/signup', (req, res, next) => {
  res.render('signup');
});

router.post('/signup', passport.authenticate('local-signup', {
  successRedirect: '/profile',
  failureRedirect: '/signup',
  failureFlash: true
})); 

router.get('/signin', (req, res, next) => {
  res.render('signin');
});


router.post('/signin', passport.authenticate('local-signin', {
  successRedirect: '/profile',
  failureRedirect: '/signin',
  failureFlash: true
}));

router.get('/profile',isAuthenticated, async (req, res, next) => {
  const asignatura = new Asignatura();
  const asignaturas = await asignatura.findAll();
  res.render('profile', {asignaturas});
});

router.get('/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect('/');
  });
});


router.get('/users', isAuthenticated, async (req, res) => {
  if(req.user.rol == "Administrador") {
    const user = new User();
    const asignatura = new Asignatura();
    const users = await user.findAll();
    const asignaturas = await asignatura.findAll();
    res.render('users', {
      users, asignaturas
    });
  } else {
    //Redirigo a los usuarios que no son administradores a /aulavirtual
    res.redirect('/aulavirtual');
  }
});

router.post('/users/add', isAuthenticated, async (req, res, next) => {
  const user = new User(req.body);
  await user.insert();
  res.redirect('/users');
});

router.post('/users/addUserCSV', (req, res) => {
  var fileUsers=req.files.file;
  cont=0;
  console.log(fileUsers.mimetype);
  fileUsers.mv(`./files/users/${fileUsers.name}`,err=>{
    if(err) return res.status(500).send({message:err});
    readCsvFile(`./files/users/${fileUsers.name}`);
    res.redirect("/users");
  });

}) ;

const readCsvFile = async (fileName) => {
  const results = [];
  await fs.createReadStream(fileName)
      .pipe(csv({ separator: "," }))
      .on("data", (data) => results.push(data))
      .on("end", async () => {
        for (const usu of results) {
          var usuario = new User();
          if (usu.nombre && usu.apellidos && usu.rol && usu.email && usu.password) {
            var emailUsuario = await usuario.findEmail(usu.email);
            if(emailUsuario == null){
              usuario.nombre = usu.nombre;
              usuario.apellidos = usu.apellidos;
              usuario.rol = usu.rol;
              usuario.email = usu.email;
              usuario.password = usu.password;
              const asignaturas = usu.asignaturas.split(',');
              usuario.asignaturas = asignaturas;
              await usuario.save();
            }else{
              console.log("El email ya existe")
            }
          } else {
            console.log(usu);
          }
        }
        console.log('Usuarios guardados correctamente.');
      });

};


router.get('/users/delete/:id', isAuthenticated, async (req, res, next) => {
  const user = new User();
  let { id } = req.params;
  await user.delete(id);
  res.redirect('/users');
});

router.get('/users/editUsuario/:id', isAuthenticated, async (req, res, next) => {
  if(req.user.rol == "Administrador") {
    var user = new User();
    user = await user.findById(req.params.id);
    const asignatura = new Asignatura();
    const asignaturas = await asignatura.findAll();
    res.render('editUsuario', { user, asignaturas });
  } else {
    //Redirigo a los usuarios que no son administradores a /aulavirtual
    res.redirect('/aulavirtual');
  }
});

router.get('/users/editUsuario', isAuthenticated, (req, res, next) => {
  //Si intenta acceder sin id igual le redirigo
  res.redirect('/aulavirtual');
});


router.post('/users/editUsuario/:id', isAuthenticated, async (req, res, next) => {
  const user = new User();
  const { id } = req.params;
  await user.update({_id: id}, req.body);
  res.redirect('/users');
});




function isAuthenticated(req, res, next) {
  if(req.isAuthenticated()) {
    return next();
  }

  res.redirect('/')
}

module.exports.router = router;
module.exports.isAuthenticated = isAuthenticated;
