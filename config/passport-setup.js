const passport = require('passport')
    , GoogleStrategy = require('passport-google-oauth20')
    , keys = require('./keys')
    , User = require('../models/User.model')
    , UserController = require('../controllers/user-controller')
    , JwtStrategy = require('passport-jwt').Strategy
    , ExtractJwt = require('passport-jwt').ExtractJwt
    , LocalStrategy = require('passport-local')
    , jwt = require('jsonwebtoken');

const googleStrategy = new GoogleStrategy({
    callbackURL: '/auth/google/redirect',
    clientID: keys.google.clientID,
    clientSecret: keys.google.clientSecret
}, (accessToken, refreshToken, profile, done) => {
    const userController = UserController();
    userController.createSocialUser(profile)
    .then((user) => {
        user.token = jwt.sign({
            id: user._id
          }, keys.jwt.secret, { expiresIn: keys.jwt.expiresIn }
        );
        console.log("sdfvef", user);
        done(null, user);
    })
    .catch((err) => {
        done(err)
    })
});

const localOption = {usernameField: 'email'};
const localLogin =  new LocalStrategy(localOption, function(email, password, done) {
    User.findOne({email: email})
    .then((user) => {
        if(!user) {
            return done(null, false);
        } else {
            done(null, user);
        }
    })
    .catch((err) => {
        done(err);
    })
});

const jwtOptions = {
    jwtFromRequest: ExtractJwt.fromHeader('authorization'),
    secretOrKey: keys.jwt.secret
};

const jwtLogin = new JwtStrategy(jwtOptions, function(payload, done) {
    User.findById(payload.id)
    .then((user) => {
        if(user) {
            done(null, user);
        } else {
            done(null, false);  
        }
    })
    .catch((err) => {
        return done(err);
    });
})

passport.use(googleStrategy);
passport.use(localLogin);
passport.use(jwtLogin);
