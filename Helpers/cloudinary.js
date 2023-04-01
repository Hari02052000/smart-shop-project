const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.cloud_name,
  api_key:process.env.api_key,
  api_secret:process.env.api_secret
});
module.exports={
 uploadImage:async(file)=>{
  let data=await cloudinary.uploader.upload(file);
  return data;
 },

 
 rename:async(file,id)=>{
  console.log('going to change')
 let data= await cloudinary.uploader.upload(
         file,
        { public_id:id, invalidate: true }
  )
  return data;
},
multifiles:(imagefiles)=>{
  return Promise.all(
       imagefiles.map((image) => {
          return new Promise((resolve, reject) => {
           cloudinary.uploader.upload(image.path, (err, url) => {
              if (err) return reject(err);
              else resolve({ URL: url.secure_url, cloudinary_id: url.public_id });
            });
          });
        })
       );
},
deleteImage:async(id)=>{
  try{
  const result = await cloudinary.uploader.destroy(id);
  return result;}
  catch(err){
    console.log(err)
  }
}}
