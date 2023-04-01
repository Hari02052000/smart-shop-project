const mongoose=require('mongoose');
const validator=require('validator');
const bcrypt=require('bcrypt');


const adminSchema=mongoose.Schema({
    name:{
        type:String,
        required:[true,'please provide your name']
    },
    password:{
        type:String,
        required:[true,'please provide a password']
    },
    confPassword:{
        type:String,
        required:[true,'conform your password'],
       validate:[function(conf){return conf===this.password},'passwords are not equal']
    },
    email:{
        type:String,
        unique:true,
        require:[true,'please enter your email'],
        validate:[validator.isEmail,'provide a valid email']
        
    }})

    adminSchema.pre('save',async function(next){
        this.password= await bcrypt.hash(this.password,12);
        this.confPassword=undefined;
        next();
    })
    
    const user=mongoose.model('admin',adminSchema);
    module.exports=user
