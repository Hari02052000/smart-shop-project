const mongoose= require('mongoose');

const productSchema=mongoose.Schema({
    productName:{
        type:String,
        required:true
    },
    category:{
        type:mongoose.Types.ObjectId,
        ref:'category',
        required:true
    },
    description:{
        type:String,
        required:true
    },
    price:{
        type:Number,
        required:true
    },
    stocks:{
        type:Number,
        required:true
        
    },
    images:{
        type:[]
    },
    brand:{
        type:String
    },
    model:{
        type:String
    },
    highlights:{
        type:[]
    },
    
    listed:{
        type:Boolean,
        default:true
    }

})

const product=mongoose.model('product',productSchema);
module.exports=product
