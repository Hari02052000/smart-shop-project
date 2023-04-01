const mongoose=require('mongoose');

const bannerSchema=mongoose.Schema({
    image:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    listed:{
        type:Boolean,
        default:true
    }
})

const banner=mongoose.model('banner',bannerSchema)
module.exports=banner