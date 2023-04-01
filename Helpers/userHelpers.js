const userModel=require('../models/userSchema')
const multer=require('multer');

module.exports={
    findCartTotel:async(id)=>{
        let usercart=await userModel.findOne({_id:id}).populate('cart.product')
   console.log(usercart.cart)
    usercart.cart.forEach(element => {
      element.product.newprice=element.quantity*(element.product.price)
      
    });
    
    
    const sum = usercart.cart.reduce((acc, item) => acc + item.product.newprice, 0);
    usercart.totel=sum
    
    return usercart
    },
  profileUpload:(req,res,next)=>{
    const multerstorage=multer.diskStorage({
      destination:(req,file,cb)=>{
      cb(null,'public/images/userprofile')
   },
  filename:(req,file,cb)=>{
  const ext=file.mimetype.split('/')[1]
  const name=req.user.email
  const img =name+'.'+ext
  cb(null,img);
  
  }})
  const multerfilter=(req,file,cb)=>{
      
      if(file.mimetype.startsWith('image')){
       cb(null,true);
      }
      else cb(err,false);
  }
  
  const upload=multer({
  storage:multerstorage,
  fileFilter:multerfilter
  })
  ///
  
  
      upload.single('image')(req,res,(err)=>{
          if(err) res.json({uploaderr:`image not uploaded:${err}`});
          else next()
      })
  
    
  },
   handleErrors:(err)=>{
   
    let errors={username:'',password:'',conffpassword:'',email:'',phone:''}
    if(err.message.includes('user validation failed')){
    Object.values(err.errors).forEach(({properties})=>{
      errors[properties.path]=[properties.message]
     console.log(err)
      
    })
    return errors;
    }
  if(err.code==11000){
    return  errors.unique=err.keyValue
  }
  }
  
}