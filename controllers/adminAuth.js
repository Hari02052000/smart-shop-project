const jwt=require('jsonwebtoken');
const adminModel=require('../models/adminSchema');

module.exports={
    isAdmin:(req,res,next)=>{
        
        const token=req.cookies.adminjwt
        if(token){
            jwt.verify(token,'key2',async(err,decoded)=>{
                if(err) res.send(err);
                else{
                
                  let admin=await adminModel.findOne({_id:decoded.id})
                  if(admin) next();
                  else res.send('something went wrong')
                       
                }
            })
        }
        else {
            res.render('admin/login');
        }
    }
}