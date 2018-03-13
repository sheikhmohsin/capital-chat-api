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
      name: profile.name.familyName,
      email: profile.emails[0].value,
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
    // req.checkBody('name', 'Name is required.').notEmpty();
    // req.checkBody('email', 'Email is required').notEmpty();
    // req.checkBody('password', 'Password is required').notEmpty();
    // let errors = validationErrors();
    // if(errors) {
    //   let err = new Error(errors[0]);
    //   err.status(400);
    //   return next(err);
    // }
    const user = new User({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      provider: 'local',
      gender: (req.body.gender) ? req.body.gender : null,
      verified: (req.body.verified) ? req.body.verified : true,
      status: (req.body.status) ? req.body.status : true
    })
    
    createUser(user)
    .then((doc) => {
      let token = createJWT(doc._id);
      res.status(200).send({token: token});
    })
    .catch((err) => {
      console.log("create", err)
      let error = new Error("Error creating object");
      error.status = 500;
      next(error);
    })
  }

  methods.login = async (req, res, next) => {
    // req.checkBody('email', 'Email is required').notEmpty();
    // req.checkBody('password', 'Password is required').notEmpty();
    // if(errors) {
    //   let err = new Error(errors[0]);
    //   err.status(400);
    //   return next(err);
    // }
    User.findOne({email: req.body.email})
    .then((user) => {
      if(!user) {
        let error = new Error('Incorrect password or email.');
        error.status = 401;
        next(error);
      } else {
        user.comparePassword(req.body.password, (err, isMatch) => {
          if(err) {
            next(err);
          }
          if(!isMatch) {
            let error = new Error('Incorrect password or email.');
            error.status = 401;
            next(error);
          } else {
            let token = createJWT(user._id);
            res.status(200).send({token: token});    
          }
        })
      }
    })
  }

  methods.changePassword = (req, res, next) => {
    // req.checkBody('userId', 'User ID is required').notEmpty();
    // req.checkBody('oldPassword', 'Old password is required').notEmpty();
    // req.checkBody('newPassword', 'New password is required').notEmpty();
    // if(errors) {
    //   let err = new Error(errors[0]);
    //   err.status(400);
    //   return next(err);
    // }
    User.findById(req.params.id)
    .then((user) => {
      if(!user) {
        let error = new Error('User not found.');
        error.status = 404;
        return next(error);
      }
      user.comparePassword(req.body.oldPassword, function(err,isMatch) {
        if(err) {
          next(err);
        } else {
          if(!isMatch) {
            let error = new Error('Incorrect Password.');
            error.status = 401;
            return next(error);
          }
          bcrypt.genSalt(10, function(err, salt) {
            if(err) {
              return next(err)
            }
            bcrypt.hash(this.password, salt, null, function(error, hash) {
              if(error) {
                return next(error)
              }
              
            })
          })
        }
      })
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
    const timestamp = new Date().getTime();
    return jwt.sign({
      id: id,
      iat: timestamp
      }, keys.jwt.secret, { expiresIn: keys.jwt.expiresIn }
    );
  }

  const createHash = async (password) => {
    return new Promise((resolve, reject) => {
      bcrypt.genSalt(10, function(err, salt) {
        bcrypt.hash(password, salt, function(err, hash) {
            resolve(hash);
        });
      });
    }) 
  }

  return methods;
}