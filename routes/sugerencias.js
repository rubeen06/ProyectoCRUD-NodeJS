const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const Sugerencia = require('../models/sugerencias');
const User = require('../models/users');
const { isAuthenticated } = require('./users');

// Configuración del transportador de correo electrónico
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER, // dirección de correo real
      pass: process.env.EMAIL_PASS
    }
  });

router.post('/sugerencias', isAuthenticated, async (req, res) => {
    // Comprobar si el usuario es un alumno
    if(req.user.rol !== 'Alumno') {
      return res.redirect('/aulavirtual');
    } 
    // Crear una nueva sugerencia
    const sugerencia = new Sugerencia({
      content: req.body.content,
      user: req.user._id
    });
  
    await sugerencia.save();

  // Obtener todos los administradores
  const admins = await User.find({ rol: 'Administrador' });

  // Enviar correo electrónico a cada administrador
  admins.forEach(admin => {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: admin.email,
      subject: 'Nueva sugerencia recibida',
      text: `Ha recibido una nueva sugerencia de ${req.user.email}: ${req.body.content}`
    };

    transporter.sendMail(mailOptions, function(error, info){
      if (error) {
        console.log(error);
      } else {
        console.log('Correo enviado: ' + info.response);
      }
    });
  });

  res.redirect('/profile');
});

router.get('/sugerencias', isAuthenticated, (req, res) => {
    if(req.user.rol !== 'Alumno') {
      return res.redirect('/aulavirtual');
    }
    res.render('sugerencias');
  });

module.exports = router;
