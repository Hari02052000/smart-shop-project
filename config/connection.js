const mongoose=require('mongoose');
mongoose.connect(process.env.db)
//mongoose.connect('mongodb://localhost:27017/smartShop') 
mongoose.connection.on('error',error=>console.error(error));
 mongoose.connection.once('open',()=>console.log('connected to database'));