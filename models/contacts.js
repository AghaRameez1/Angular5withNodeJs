const mongoose = require('mongoose');

const ContactSchema = mongoose.Schema({
    first_name :{
        type : String,
        required : true
    },
    last_name:{
        type : String,
        required : true
    },
    phone:{
        type : String,
        required : true
    },
    userContacts:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UserModel',
        require: true
    }
});

const Contact = module.exports = mongoose.model('Contact',ContactSchema)