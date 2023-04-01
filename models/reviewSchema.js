const mongoose=require('mongoose')

const reviewSchema=mongoose.Schema({
    product:{
        type:mongoose.Types.ObjectId,
        ref:'product',
        required:true
        
    },
    
    user:{
        type:mongoose.Types.ObjectId,
        ref:'user',
        required:true
    },
    rating:{
        type:Number,
        required:true
    },
    review:{
        type:String,
        required:true
    }
})
const review=mongoose.model('review',reviewSchema);
module.exports=review