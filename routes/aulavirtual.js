const router = require('express').Router();
const passport = require('passport');
const User = require('../models/users');
const Asignatura = require('../models/asignaturas');
/*
router.get('/aulavirtual', isAuthenticated, async (req, res) => {
    const asignatura = new Asignatura();
    const asignaturas = await asignatura.findAll();
    res.render('asignaturas', {
      asignaturas
    });
  });*/