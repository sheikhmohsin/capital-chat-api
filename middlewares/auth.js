const jwt = require('jsonwebtoken')
  , keys = require('../config/keys');

module.exports = (req, res, next) => {
  const token = req.header.token || req.body.token || req.get('token');
  if(!token) {
    let err = new Error("Please login to view this page.");
    err.status = 401;
    next(err);
  } else {
    jwt.verify(token, keys.jwt.secret, function(err, decoded) {
      if(err) {
        console.log(err)
      } else {
        console.log("id", decoded.id);
        req.userId = decoded.id;
        next();
      }
    });
  }
}