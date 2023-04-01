const express = require('express');
const path = require('path')
const app = express();
const multer=require('multer');
var nocache = require('nocache');
const cookieParser=require('cookie-parser')
const bodyparser=require('body-parser')
const dotenv= require('dotenv')
dotenv.config({path:'./.env'});
require('./config/connection');

require('ejs');



const port =3000;
const adminRoute = require('./routes/admin');
const userRoute = require('./routes/user');




// set view engine
app.set('views', path.join(__dirname, '/views'))  //or

 
app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({extended:false}));
app.use(bodyparser.json())
app.use(cookieParser());
app.use(nocache());
app.use('/',userRoute);
app.use('/admin',adminRoute);

app.use(function(req, res) {
    res.status(404);
    res.render('user/error' );
  });

app.listen(port||3000,()=>console.log('server started'))


