const mongoose=require('mongoose');

const couponSchema=mongoose.Schema({
    couponId:{
        type:String,
        required:true,
        unique:true
    },
    status:{
        type:Boolean,
        default:true
    },
    userAllowed:{
        type:Number,
        required:true
    },
    claimedUsers:{
        type:Number,
        default:0
    },
    expiryDate:{
        type:Date,
        required:true
    },
    minimumPurchase:{
        type:Number,
        required:true
    },
    discount:{
        type:Number,
        required:true
    },
    maxAmount:{
        type:Number,
        default:50
    }
})

const coupon=mongoose.model('coupon',couponSchema)
module.exports=coupon