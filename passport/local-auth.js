const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const User = require('../models/users');

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  const user = await User.findById(id);
  done(null, user);
});

passport.use('local-signup', new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password',
  passReqToCallback: true
}, async (req, email, password, done) => {
  const { nombre, apellidos, rol } = req.body;
  var user = new User();
   user = await user.findEmail( email)
  if(user) {
    return done(null, false, req.flash('signupMessage', 'The Email is already Taken.'));
  } else {
    const newUser = new User();
    newUser.nombre = nombre;
    newUser.apellidos = apellidos;
    newUser.rol = rol;
    newUser.email = email;
    newUser.password = newUser.encryptPassword(password);
    await newUser.insert();
    done(null, newUser);
  }
}));

passport.use('local-signin', new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password',
  passReqToCallback: true
}, async (req, email, password, done) => {
  var user = new User();
   user = await user.findEmail( email);
  if(!user) {
    return done(null, false, req.flash('signinMessage', 'No User Found'));
  }
  if(!user.comparePassword(password)) {
    return done(null, false, req.flash('signinMessage', 'Incorrect Password'));
  }
  return done(null, user);
}));
