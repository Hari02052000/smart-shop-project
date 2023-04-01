const mongoose=require('mongoose');
const orderSchema=mongoose.Schema({
    products:
        [
            {
                product:{
                    type:mongoose.Types.ObjectId,
                    ref:'product'
                },
                quantity:{
                    type:Number,
                    
                }
               
            }
        ]
    
    ,
    user:{
        type:mongoose.Types.ObjectId,
        ref:'user',
        required:true
    },
    totelAmount:{
        type:Number,
        required:true
    },
    paymentOption:{
        type:'string',
        required:true
    },
    paymentStatus:{
        type:String,
        default:'pending'
    },
    orderStatus:{
        type:String,
        default:'placed'
    },
    date:{
        type:Date
    },
    coupon:{
        type:String
    },
    billingAdress:{
        type:String,
        required:true
    },
    payedAmoundFromWallet:{
        type:String
    },
    deliverdDate:{
        type:Date
    }
})

const order=mongoose.model('order',orderSchema)
module.exports=order