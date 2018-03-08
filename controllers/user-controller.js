module.exports = () => {
  let methods = {}
    , mongo = require('mongodb')
    , User = require('../models/User.model')
    , mongoose = require('mongoose')
    , keys = require('../config/keys')
    , bcrypt = require('bcryptjs')
    , jwt = require('jsonwebtoken');

  methods.createSocialUser = (profile) => {
    const user = new User({
      firstName: profile.name.givenName,
      lastName: profile.name.familyName,
      username: profile.emails[0].value,
      password: password,
      provider: (profile.provider) ? profile.provider : 'local',
      providerId: profile.id,
      gender: profile.gender,
      image: profile._json.image.url
    })
    return createUser(user);
  }

  methods.findUserById = (req, res, next) => {
    return User.findById(id);
  }

  methods.findUserByIdSocial = (id) => {
    return User.findById(id);
  }

  methods.logout = (req, res, next) => {
    res.send("User logged out successfully");
  }

  methods.signup = async (req, res, next) => {
    // req.checkBody('firstName', 'First name is required.').notEmpty();
    // req.checkBody('username', 'Username/Email is required').notEmpty();
    // req.checkBody('password', 'Password is required').notEmpty();
    // let errors = validationErrors();
    // if(errors) {
    //   let err = new Error(errors[0]);
    //   err.status(400);
    //   return next(err);
    // }
    let password = await createHash(req.body.password);
    const user = new User({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      username: req.body.username,
      password: password,
      provider: 'local',
      gender: (req.body.gender) ? req.body.gender : null,
      verified: (req.body.verified) ? req.body.verified : true,
      status: (req.body.status) ? req.body.status : true
    })
    createUser(user)
    .then((doc) => {
      let token = createJWT(doc._id);
      res.render('token', {token: token});
    })
    .catch((err) => {
      console.log("create", err)
      let error = new Error("Error creating object");
      error.status = 500;
      next(error);
    })
  }

  methods.login = async (req, res, next) => {
    // req.checkBody('username', 'Username/Email is required').notEmpty();
    // req.checkBody('password', 'Password is required').notEmpty();
    // if(errors) {
    //   let err = new Error(errors[0]);
    //   err.status(400);
    //   return next(err);
    // }
    let password = await createHash(req.body.password);
    User.findOne({username: req.body.username})
    .then((doc) => {
      if(doc && doc.password == password) {
        let token = createJWT(doc._id);
        res.render('token', {token: token});
      } else {
        let error = new Error('Incorrect password or username.');
        error.status = 401;
        next(err);
      }
    })
    .catch((err) => {
      let error = new Error('Incorrect password or username.');
        error.status = 401;
        next(err);
    })
  }

  const createUser = (user) => {
    return new Promise((resolve, reject) => {
      user.save()
      .then((doc) => {
          resolve(doc);
      })
      .catch((err) => {
        reject(err)
      })
    })
  }

  const createJWT = (id) => {
    return jwt.sign({
      id: id
      }, keys.jwt.secret, { expiresIn: keys.jwt.expiresIn }
    );
  }

  const createHash = async (password) => {
    await bcrypt.genSalt(10, function(err, salt) {
      bcrypt.hash(password, salt, function(err, hash) {
          return hash;
      });
    });
  }

  return methods;
}