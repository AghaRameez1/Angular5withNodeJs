var crypto = require('crypto');
var jwt = require('jsonwebtoken');
var mongoose = require('mongoose');

var userSchema = new mongoose.Schema({
    email: {
      type: String,
      unique: true,
      required: true
    },
    firstname: {
      type: String,
      required: true
    },
    lastname: {
      type: String,
      required: true
    },
    ProfileImage: 
      { data: Buffer, contentType: String },
    hash: String,
    salt: String
  });

  //Setting Password
  userSchema.methods.setPassword = function(password){
    this.salt = crypto.randomBytes(16).toString('hex');
    this.hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64, 'sha512').toString('hex');
  };

  /// Checking Password
  userSchema.methods.validPassword = function(password) {
    var hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64, 'sha512').toString('hex');
    return this.hash === hash;
  };

  userSchema.methods.generateJwt = function() {
    var expiry = new Date();
    expiry.setDate(expiry.getDate() + 7);
  
    return jwt.sign({
      _id: this._id,
      email: this.email,
      firstname: this.firstname,
      lastname: this.lastname,
      exp: parseInt(expiry.getTime() / 1000),
    }, "MY_SECRET"); // DO NOT KEEP YOUR SECRET IN THE CODE!
  };

  const UserModel = mongoose.model('UserModel', userSchema);