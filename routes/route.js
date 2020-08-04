const express = require('express');
var passport = require('passport');
var mongoose = require('mongoose');
const multer = require("multer");
const router = express.Router();
const ContactModel = require('../models/contacts');
var Contact = mongoose.model('Contact');
const UserModel = require('../models/users');
var User = mongoose.model('UserModel')
var fs = require('fs');


var jwt = require('express-jwt');
const { isNull } = require('util');
var auth = jwt({
    secret: 'MY_SECRET',
    userProperty: 'payload'
});
var storage = multer.diskStorage(
    {
        destination: './uploads/',
        filename: function (req, file, cb) {
            cb(null, file.originalname);
        }
    }
);
var upload = multer({ storage: storage });

router.post('/login', function (req, res) {
    passport.authenticate('local', function (err, user, info) {
        var token;
        //if Password throws/catches an error
        if (err) {

            res.status(404).json(err)
            return;
        }
        //if User is found
        if (user) {
            token = user.generateJwt();
            res.status(200);
            res.json({
                'token': token
            });
        }
        else {
            //If user is not found  
            res.status(200).json(info)
        }
    })(req, res);
});

router.post('/register', function (req, res) {
    var email = req.body.email
    User.find({ email: email }, { _id: 1 }).exec(function (err, userdoc) {
        if (err) {
            res.json({
                'data': 'User Already Registered'
            })

        } else if (userdoc.length == 1) {
            res.json({
                'data': 'User Already Registered'
            })
        }
        else {
            var user = new User();
            user.firstname = req.body.firstname;
            user.lastname = req.body.lastname;
            user.email = email;
            user.setPassword(req.body.password);
            var img = fs.readFileSync('./uploads/blank-profile-picture-973460_640.png');
            var finalImg = {
                contentType: 'image/png',
                data: new Buffer(img)
            };
            user.ProfileImage = finalImg
            user.save(function (err) {
                if (err) {
                    console.error(err)
                }
                else {
                    var token;
                    token = user.generateJwt();
                    res.status(200);
                    res.json({
                        'token': token
                    });
                }
            });
        }
    });
});
router.get('/profile', auth, function (req, res) {
    ///If No user ID exists in JWT return 401
    if (!req.payload._id) {
        res.status(401).json({
            'message': 'Unauthorized Error: Private Profile'
        });
    } else {
        //Otherwise continue
        User.findById(req.payload._id).exec(function (err, user) {
            res.status(200).json(user);
        });
    }
});
router.get('/image/:id', function (req, res) {
    try {
        User.findById(req.params.id).exec(function (err, user) {
            if (err) {
                console.log(err)
            }
            else {
                res.contentType(user['ProfileImage'].contentType);
                res.send(user['ProfileImage'].data);
                // res.json({ 'image': Buffer.from(user['ProfileImage'].data, 'base64') })
            }
        });
    }
    catch (err) {
        console.log(err)
    }
})
router.post('/profile/image', upload.single('image'), function (req, res) {
    var id = req.body.id;
    if (req.file.path) {
        try {
            User.findById(id).exec(function (err, user) {
                user.ProfileImage.data = fs.readFileSync(req.file.path);
                user.ProfileImage.contentType = 'image/png'
                user.save((err, user) => {
                    if (err) {
                        console.log(err);
                        res.status(500).contentType("text/plain").end("Oops! Something went wrong!");
                    }
                    else {
                        res.send(user);
                    }
                });
            });
        }
        catch (err) {
            console.log(err)
        }
    }
    else {
        console.log(err);
        res.status(500).contentType("text/plain").end("Oops! Something went wrong!");

    }
});
router.get('/profile/:id', function (req, res) {
    var id = req.params.id;
    try {
        User.findById(id).exec(function (err, user) {
            if (err) {
                console.log(err)
            }
            else {
                res.contentType(user['ProfileImage'].contentType);
                res.send(user['ProfileImage'].data);
                res.json({ 'image': Buffer.from(user['ProfileImage'].data, 'base64') })
            }
        });
    }
    catch (err) {
        console.log(err)
    }
});

router.get('/contacts/:id', (req, res, next) => {
    var id = req.params.id
    ContactModel.find({ userContacts: id }).exec(function (err, contacts) {
        res.json(contacts)
    })
});
/// add contact
router.post('/contact', (req, res, next) => {
    ///Logic to add contact
    let newContact = new ContactModel({
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        phone: req.body.phone,
        userContacts: req.body.userContacts
    });
    newContact.save((err, contact) => {
        if (err) {
            res.json({ msg: 'Failed to add Contact' })
        }
        else {
            res.json({ msg: 'Contact added successfully' })
        }
    });
})
/// delete contact
router.delete('/contact/:id', (req, res, next) => {
    ///logic to delete contact
    ContactModel.deleteOne({ _id: req.params.id }, function (err, result) {
        if (err) {
            res.json(err);
        }
        else {
            res.json(result);
        }
    })
})
/// update contact
router.put('/contact/:id', (req, res, next) => {
    ///logic to update contact
    console.log(req.body, req.params.id)
    var values = { $set: { first_name: req.body.first_name, last_name: req.body.last_name, phone: req.body.phone } }
    ContactModel.updateOne({ _id: req.params.id }, values, function (err, result) {
        if (err) {
            res.json(err);
        }
        else {
            res.json(result);
        }
        
    });
})


///Authentication Module


module.exports = router;