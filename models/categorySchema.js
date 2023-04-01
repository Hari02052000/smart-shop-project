const mongoose=require('mongoose');

const categorySchema=mongoose.Schema({
    category:{
        type:String,
        unique:true,
        required:[true,'enter the catogery name']
    },
    image:{type:String},
    cloudinaryId:{type:String},
    listed:{
        type:Boolean,
        default:true
    }
})

const category=mongoose.model('category',categorySchema);
module.exports=category