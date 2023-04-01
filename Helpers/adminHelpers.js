const multer=require('multer');



module.exports={
uploadCategory:(req,res,next)=>{
const multerfilter=(req,file,cb)=>{
    
    if(file.mimetype.startsWith('image')){
     cb(null,true);
    }
    else cb(err,false);
}

const upload=multer({
storage:multer.diskStorage({}),
fileFilter:multerfilter
})

    upload.single('image')(req,res,(err)=>{
        if(err) res.json({uploaderr:`image not uploaded:${err}`});
        else next()
    })
},
uploadProducts:(req,res,next)=>{

const multerstorage=multer.diskStorage({
    destination:(req,file,cb)=>{
    cb(null,'public/images/products')
 },
filename:(req,file,cb)=>{
const ext=file.mimetype.split('/')[1]
const name=req.body.productName
const img =name+Date.now()+'.'+ext
cb(null,img);

}})
const multerfilter=(req,file,cb)=>{
    
    if(file.mimetype.startsWith('image')){
     cb(null,true);
    }
    else cb(err,false);
}

const upload=multer({
storage:multer.diskStorage({}),
fileFilter:multerfilter
})
///
upload.array('images',10)(req,res,(err)=>{
    if (err) res.send(`file not uploaded${err}`)
    else next();
    
    
})

},
uploadBanner:(req,res,next)=>{
    const multerstorage=multer.diskStorage({
        destination:(req,file,cb)=>{
        cb(null,'public/images/banner')
     },
    filename:(req,file,cb)=>{
    const ext=file.mimetype.split('/')[1]
    const img ='banner'+Date.now()+'.'+ext
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
//genarate colurs
generateBackgroundColors:(count)=> {
    var colors = [];
    for (var i = 0; i < count; i++) {
      var r = Math.floor(Math.random() * 256);
      var g = Math.floor(Math.random() * 256);
      var b = Math.floor(Math.random() * 256);
      colors.push(`rgba(${r},${g},${b},0.2)`);
    }
    return colors;
  }
}