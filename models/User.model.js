'use strict';

let mongoose = require('mongoose');

let Schema = mongoose.Schema;

let UserSchema = new Schema({
  firstName: String,
  lastName: String,
  username: String,
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

  next();
});

UserSchema.pre('update', function() {
  this.update({},{ $set: { updated_at: new Date() } });
});

module.exports = mongoose.model('User', UserSchema);