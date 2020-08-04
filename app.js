var express = require('express')
var mongoose = require('mongoose')
var bodyparser = require('body-parser')
var cors = require('cors')
var path = require('path')
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var passport = require('passport');
var multer = require('multer');
var fs = require('fs');
require('./models/users');
require('./config/passport');
var app = express()

const route = require('./routes/route' )

///Connect to Mongoo DB
mongoose.connect('mongodb://localhost:27017/contactlist',{useCreateIndex:true ,useNewUrlParser:true, useUnifiedTopology: true });

mongoose.connection.on('connected',()=>{
    console.log('Connected to database');
});
mongoose.connection.on('error',(err)=>{
    if(err){
        console.log('Error'+err);
    }
    
});
///Adding Middleware - Cors
app.use(cors());
///

/// Body-Parser
app.use(bodyparser.json())
///
////Static Foler
app.use(express.static(path.join(__dirname,'public')))

app.use(passport.initialize());
app.use('/api', route)

///Testing Server
app.get('/',function(req, res){
    res.send('Hello World')
})
app.use(function(err,req,res,next){
    if(err.name === 'Unauthorized Error'){
        res.status(401);
        res.json({
            'message': err.name +": "+ err.message
        })
    }
});

const port = '3000'

app.listen(port,()=>{
    console.log('server started at port: '+port)
})