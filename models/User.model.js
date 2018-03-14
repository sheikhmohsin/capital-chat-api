'use strict';

let mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

let Schema = mongoose.Schema;

let UserSchema = new Schema({
  name: String,
  email: {
    type: String,
    unique: true
  },
  gender: String,
  provider: String,
  providerId: String,
  password: String,
  verified: {
      type: Boolean,
      default: true
  },
  status: {
      type: Boolean,
      default: true
  },
  deviceId: String,
  deviceType: String,
  created_at: {
    type: Date,
    default: Date.now()
  },
  update_at: Date
});

UserSchema.pre('save', function(next) {
  // get the current date
  let currentDate = new Date();

  // change the updated_at field to current date
  this.updated_at = currentDate;

  // if created_at doesn't exist, add to that field
  if (!this.created_at)
    this.created_at = currentDate;

  bcrypt.genSalt(10, function(err, salt) {
    if(err) {
      return next(err)
    }
    bcrypt.hash(this.password, salt, null, function(error, hash) {
      if(error) {
        return next(error)
      }
      this.password = hash;
      next();
    })
  })
});

UserSchema.pre('update', function() {
  this.update({},{ $set: { updated_at: new Date() } });
});

UserSchema.methods.comparePassword = function(candidatePassword, callback) {
  bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
    if(err) {
      return callback(err);
    }
    callback(null, isMatch);
  });
}

module.exports = mongoose.model('User', UserSchema);