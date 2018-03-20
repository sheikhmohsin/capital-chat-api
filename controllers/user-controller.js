module.exports = () => {
  let methods = {}
    , mongo = require('mongodb')
    , User = require('../models/User.model')
    , mongoose = require('mongoose')
    , keys = require('../config/keys')
    , bcrypt = require('bcryptjs')
    , axios = require('axios')
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

  methods.registerSocialUser = (req, res, next) => {
    if(!req.body.socialMediaType || req.body.socialMediaType == '') {
      let error = new Error("Social Media Type is required.")
      error.status = 400;
      let response = {
        error: true,
        message: error.message,
        user: null
      }
      res.status(error.status).send(response);
    } else if(!req.body.accessToken || req.body.accessToken == '') {
      let error = new Error("Access Token is required.")
      error.status = 400;
      let response = {
        error: true,
        message: error.message,
        user: null
      }
      res.status(error.status).send(response);
    } else if(!req.body.deviceId || req.body.deviceId == '') {
      let error = new Error("Device Id is required.")
      error.status = 400;
      let response = {
        error: true,
        message: error.message,
        user: null
      }
      res.status(error.status).send(response);
    } else if(!req.body.deviceType || req.body.deviceType == '') {
      let error = new Error("Device Type is required.")
      error.status = 400;
      let response = {
        error: true,
        message: error.message,
        user: null
      }
      res.status(error.status).send(response);
    } else {
      let accessToken = req.body.accessToken;
      let socialMediaType = req.body.socialMediaType;
      let deviceId = (req.body.deviceId) ? req.body.deviceId : null;
      let deviceType = (req.body.deviceType) ? req.body.deviceType : null;
      let user = {};
      if(socialMediaType == 'google') {
        axios.get('https://www.googleapis.com/plus/v1/people/me?access_token='+accessToken)
        .then((res) => {
          console.log("res", res.data)
          if(!res.data.emails) {
            let error = new Error("Unable to connect to server. Please try again later.");
            error.status = 500;
            let response = {
              error: true,
              message: error.message,
              user: null
            }
            res.status(error.status).send(response);
          }
          user = {
            name: res.data.name.givenName + ' ' + res.data.name.familyName,
            email: res.data.emails[0].value,
            provider: socialMediaType,
            providerId: res.data.id,
            gender: (res.data.gender) ? res.data.gender : null,
            address: null,
            contact: null,
            dob: null,
            occupation: null,
            organization: null,
            deviceId: (req.body.deviceId) ? req.body.deviceId : null,
            deviceType: (req.body.deviceType) ? req.body.deviceType : null,
            verified: (req.body.verified) ? req.body.verified : true,
            status: (req.body.status) ? req.body.status : true,
            image: null,
            bio: (req.body.bio) ? req.body.bio : null
          }
          createSocialUser(user)
          .then((doc) => {
            let id = doc._id;
            let token = createJWT(doc._id);
            let response = {
              error: false,
              message: "User Signed In successfully.",
              user: {
                userId: id,
                ...doc._doc 
              },
              token: token
            }
            delete response.user['_id'];
            delete response.user['provider'];
            delete response.user['providerId'];
            delete response.user['__v'];
            delete response.user['created_at'];
            res.status(200).send(response);
          })
          .catch((err) => {
            console.log("create", err)
            let error = new Error("Unable to connect to server. Please try again later.");
            error.status = 500;
            let response = {
              error: true,
              message: error.message,
              user: null
            }
            res.status(error.status).send(response);
          })
        })
        .catch((err) => {
          console.log("get google err", err);
          let error = new Error("Unable to connect to server. Please try again later.");
          error.status = 500;
          let response = {
            error: true,
            message: error.message,
            user: null
          }
          res.status(error.status).send(response);
        })
      } else if(socialMediaType == 'facebook') {
        axios.get('https://graph.facebook.com/me?fields=name,id,email,gender&access_token='+accessToken)
        .then((res) => {
          user = {
            name: res.data.name,
            email: res.data.email,
            provider: socialMediaType,
            providerId: res.data.id,
            gender: res.data.gender,
            address: null,
            contact: null,
            dob: null,
            occupation: null,
            organization: null,
            deviceId: (req.body.deviceId) ? req.body.deviceId : null,
            deviceType: (req.body.deviceType) ? req.body.deviceType : null,
            verified: (req.body.verified) ? req.body.verified : true,
            status: (req.body.status) ? req.body.status : true,
            image: null,
            bio: (req.body.bio) ? req.body.bio : null
          }
          user.email = user.email.replace('\u0040', '@');
          createSocialUser(user)
          .then((doc) => {
            let id = doc._id;
            let token = createJWT(doc._id);
            let response = {
              error: false,
              message: "User Signed In successfully.",
              user: {
                userId: id,
                ...doc._doc               
              },
              token: token
            }
            delete response.user['_id'];
            delete response.user['provider'];
            delete response.user['providerId'];
            delete response.user['__v'];
            delete response.user['created_at'];
            res.status(200).send(response);
          })
          .catch((err) => {
            console.log("create", err)
            let error = new Error("Unable to connect to server. Please try again later.");
            error.status = 500;
            let response = {
              error: true,
              message: error.message,
              user: null
            }
            res.status(error.status).send(response);
          })
        })
        .catch((err) => {
          console.log("get facebook err", err);
          let error = new Error("Unable to connect to server. Please try again later.");
            error.status = 500;
            let response = {
              error: true,
              message: error.message,
              user: null
            }
            res.status(error.status).send(response);
        })
      } else {
        console.log("create", err)
        let error = new Error("Please provide a valid social media type.");
        error.status = 500;
        let response = {
          error: true,
          message: error.message,
          user: null
        }
        res.status(error.status).send(response);
      }
    }
  }

  methods.findUserByIdSocial = (id) => {
    return User.findById(id);
  }

  methods.logout = (req, res, next) => {
    res.send("User logged out successfully");
  }

  methods.signup = async (req, res, next) => {
    if(!req.body.email || req.body.email == '') {
      let error = new Error("Please provide a valid email.")
      error.status = 400;
      let response = {
        error: true,
        message: error.message,
        user: null
      }
      res.status(error.status).send(response);
    } else if(!req.body.password || req.body.password == '') {
      let error = new Error("Please provide a valid password.")
      error.status = 400;
      let response = {
        error: true,
        message: error.message,
        user: null
      }
      res.status(error.status).send(response);
    } else if(!req.body.name || req.body.name == '') {
      let error = new Error("Please provide a valid name.")
      error.status = 400;
      let response = {
        error: true,
        message: error.message,
        user: null
      }
      res.status(error.status).send(response);
    } else {
      const user = new User({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        provider: 'local',
        providerId: null,
        gender: (req.body.gender) ? req.body.gender : null,
        address: (req.body.address) ? req.body.address : null,
        contact: (req.body.contact) ? req.body.contact : null,
        dob: (req.body.dob) ? req.body.dob : null,
        occupation: (req.body.occupation) ? req.body.occupation : null,
        organization: (req.body.organization) ? req.body.organization : null,
        deviceId: (req.body.deviceId) ? req.body.deviceId : null,
        deviceType: (req.body.deviceType) ? req.body.deviceType : null,
        verified: (req.body.verified) ? req.body.verified : true,
        status: (req.body.status) ? req.body.status : true,
        image: null,
        bio: (req.body.bio) ? req.body.bio : null,
      })  
      createUser(user)
      .then((doc) => {
        let id = doc._id;
        let token = createJWT(id);
        let response = {
          error: false,
          message: "Signed Up successfully.",
          user: {
            ...doc._doc,
            userId: id
          },
          token: token
        }
        delete response.user['_id'];
        delete response.user['provider'];
        delete response.user['providerId'];
        delete response.user['__v'];
        delete response.user['created_at'];
        res.status(200).send(response);
      })
      .catch((err) => {
        console.log(err);
        let message = "Unable to connect to server. Please try again later.";
        if(err.message == "Email already exists.") {
          message = "Email already exists."
        }
        let error = new Error(message);
        error.status = 500;
        let response = {
          error: true,
          message: error.message,
          user: null
        }
        res.status(error.status).send(response);
      })
    }
  }

  methods.login = async (req, res, next) => {
    if(!req.body.email || req.body.email == '') {
      let error = new Error("Please provide a valid E-mail.")
      error.status = 400;
      let response = {
        error: true,
        message: error.message,
        user: null
      }
      res.status(error.status).send(response);
    } else if(!req.body.password || req.body.password == '') {
      let error = new Error("Please provide a valid password.")
      error.status = 400;
      let response = {
        error: true,
        message: error.message,
        user: null
      }
      res.status(error.status).send(response);
    } else {
      User.findOne({email: req.body.email})
      .then((user) => {
        if(!user || (user && user.provider != 'local')) {
          let error = new Error('Incorrect password or email.');
          error.status = 401;
          let response = {
            error: true,
            message: error.message,
            user: null
          }
          res.status(error.status).send(response);
        } else {
          user.comparePassword(req.body.password, (err, isMatch) => {
            if(err) {
              let error = new Error('Incorrect password or email.');
              error.status = 401;
              let response = {
                error: true,
                message: error.message,
                user: null
              }
              res.status(error.status).send(response);
            }
            if(!isMatch) {
              let error = new Error('Incorrect password or email.');
              error.status = 401;
              let response = {
                error: true,
                message: error.message,
                user: null
              }
              res.status(error.status).send(response);
            } else {
              let id = user._id;
              let token = createJWT(user._id);
              let response = {
                error: false,
                message: "Logged In successfully.",
                user: {
                  userId: id,
                  ...user._doc
                },
                token: token
              }
              delete response.user['_id'];
              delete response.user['provider'];
              delete response.user['providerId'];
              delete response.user['__v'];
              delete response.user['created_at'];
              res.status(200).send(response);    
            }
          })
        }
      })
      .catch((err) => {
        console.log('find one error', err);
        let error = new Error("Unable to connect to server. Please try again later.");
        error.status = 500;
        let response = {
          error: true,
          message: error.message,
          user: null
        }
        res.status(error.status).send(response);
      })
    }
  }

  methods.changePassword = (req, res, next) => {
    req.checkBody('userId', 'User ID is required').notEmpty();
    req.checkBody('oldPassword', 'Old password is required').notEmpty();
    req.checkBody('newPassword', 'New password is required').notEmpty();
    if(errors) {
      let err = new Error(errors[0]);
      err.status(400);
      let response = {
        error: true,
        message: err.message,
        user: null
      }
      res.status(err.status).send(response);
    }
    User.findById(req.params.id)
    .then((user) => {
      if(!user) {
        let error = new Error('User not found.');
        error.status = 404;
        let response = {
          error: true,
          message: error.message,
          user: null
        }
        return res.status(error.status).send(response);
      }
      user.comparePassword(req.body.oldPassword, function(err,isMatch) {
        if(err) {
          console.log('find one error', err);
          let error = new Error("Unable to connect to server. Please try again later.");
          error.status = 500;
          let response = {
            error: true,
            message: error.message,
            user: null
          }
          res.status(error.status).send(response);
        } else {
          if(!isMatch) {
            let error = new Error('Incorrect password or email.');
            error.status = 401;
            let response = {
              error: true,
              message: error.message,
              user: null
            }
            return res.status(error.status).send(response);
          }
          bcrypt.genSalt(10, function(err, salt) {
            if(err) {
              console.log('find one error', err);
              let error = new Error("Unable to connect to server. Please try again later.");
              error.status = 500;
              let response = {
                error: true,
                message: error.message,
                user: null
              }
              return res.status(error.status).send(response);
            }
            bcrypt.hash(this.password, salt, null, function(error, hash) {
              if(error) {
                console.log('find one error', err);
                let error = new Error("Unable to connect to server. Please try again later.");
                error.status = 500;
                let response = {
                  error: true,
                  message: error.message,
                  user: null
                }
                return res.status(error.status).send(response);
              }
              
            })
          })
        }
      })
    })
    .catch((err) => {
      console.log("find by id error", err);
      let error = new Error("Unable to connect to server. Please try again later.");
      error.status = 500;
      let response = {
        error: true,
        message: error.message,
        user: null
      }
      res.status(error.status).send(response);
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

  const createSocialUser = (user) => {
    return new Promise((resolve, reject) => {
      User.findOne({email: user.email})
      .then((userObj) => {
        if(userObj) {
          resolve(userObj)
        } else {
          let newUser = new User(user);
          newUser.save()
          .then((doc) => {
            resolve(doc);
          })
          .catch((err) => {
            reject(err);
          })
        }
      })
      .catch((err) => {
        reject(err);
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