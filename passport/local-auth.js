const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../model/User');



passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    const user = await User.findById(id);
    done(null, user);
});


// registro
passport.use('local-signup', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
    }, async (req, email, password, done) => {
        const user = await User.findOne({email:email});
        let confpassword = req.body.confpassword;
        console.log(user);
        if (user) {
            return done(null, false, req.flash('registerMessage', 'Ese correo ya existe'));
        } else if (password.length<6) {
            return done(null, false, req.flash('registerMessage', 'La contraseña debe ser más larga; 6 caracteres mínimo'));
        } else if (confpassword!=password) {
            return done(null, false, req.flash('registerMessage', 'La contraseña no coincide con su confirmación'));
        } else {
            const newUser = new User();
            newUser.email = email;
            newUser.password = newUser.encryptPassword(password);
            await newUser.save();
            let group = req.body.group;
            await User.updateOne({email:email}, {$set: {group:group}});
            done(null, newUser, req.flash('registerMessage', 'Se registró el usuario; resta su activación por parte del grupo de predicación'));
        }
    }
));


//login
passport.use('local-signin', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, async (req, email, password, done) => {
    const user = await User.findOne({email:email});
    console.log("USER EN LOGIN:", user)
    if (!user) {
        return done(null, false, req.flash('signinMessage', 'El correo fue mal escrito o no está registrado'));
    }
    if (!user.comparePassword(password)) {
        return done(null, false, req.flash('signinMessage', 'Contraseña incorrecta, ' + user.email), req.flash('emailMessage', user.email));
    }
    if (user.estado=='desactivado') {
        return done(null, false, req.flash('signinMessage', 'Esta cuenta está registrada pero aun no ha sido activada por el grupo de territorios, ' + user.email), req.flash('emailMessage', user.email));
    }
    return done(null, user, req.flash('signinMessage', 'Ingreso exitoso'));
}));
