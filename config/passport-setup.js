const passport = require('passport')
    , GoogleStrategy = require('passport-google-oauth20')
    , keys = require('./keys')
    , User = require('../models/User.model')
    , UserController = require('../controllers/user-controller')
    , jwt = require('jsonwebtoken');

passport.use(
    new GoogleStrategy({
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
    })
)
