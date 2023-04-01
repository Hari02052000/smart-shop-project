const mongoose=require('mongoose');
const validator=require('validator');
const bcrypt=require('bcrypt');
const prodect = require('./productSchema');

    
const userSchema=mongoose.Schema({
    username:{
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
        
    },
    phone:{
     type:String,
     unique:true,
     require:[true,'please provide your phone number']
    },
    isBlocked:{
     type:Boolean,
     default:false
    },
    isActive:{
        type:Boolean,
        default:false
    },
    profile:{
        type:String,
        default:'default.png'
    },
    adress:[
        {name:{
            type:String,
        },
        house:{
            type:String
        },
         city:{
            type:String
         },
        zip:{
            type:String
        }}
    ],
    cart:[
        {
            product:{
                type:mongoose.Types.ObjectId,
                ref:'product'
            },
            quantity:{
                type:Number,
                default:1
            }
           
        }
    ],
    wishlist:[
        {
            product:{
                type:mongoose.Types.ObjectId,
                ref:'product'
            }
        }
    ],
    wallet:{
        type:Number,
        default:0,
        min:0
    }

})

userSchema.pre('save',async function(next){
    this.password= await bcrypt.hash(this.password,12);
    this.confPassword=undefined;
    next();
})

const user=mongoose.model('user',userSchema);
module.exports=user