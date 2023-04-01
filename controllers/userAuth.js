const jwt=require('jsonwebtoken');
const userModel=require('../models/userSchema');

module.exports={
    cheakUser:(req,res,next)=>{
        let user=undefined
        const token=req.cookies.jwt
        if(token){
            jwt.verify(token,'key1',async(err,decoded)=>{
                if(err) res.send(err);
                else{
                
                  user=await userModel.findOne({_id:decoded.id})
                 
                  let isBlocked=user?.isBlocked
                  if(isBlocked) res.send('you are blocked by admin');
                  if(!isBlocked)
                  {
                    req.user=user
                    next();
                  } 
                 
                }
            })
        }
        else {
            req.user=user
           next();
        }
    },



    isuser:(req,res,next)=>{
        
        const token=req.cookies.jwt
        if(token){
            jwt.verify(token,'key1',async(err,decoded)=>{
                if(err) res.send(err);
                else{
                    user=await userModel.findOne({_id:decoded.id})
                    let isActive=user?.isActive
                    let isBlocked=user?.isBlocked
                    if(isBlocked) res.send('you are blocked by admin');
                    if(!isActive)
                    {
                        res.render('user/otp',{user});
                    
                    } 
                     
                }
            })
        }
        else {
            next();
        }
    },
    isAuth:(req,res,next)=>{
        let user=undefined
        const token=req.cookies.jwt
        if(token){
            jwt.verify(token,'key1',async(err,decoded)=>{
                if(err) res.send(err)
                else{
                
                  user=await userModel.findOne({_id:decoded.id})
                  let isActive=user?.isActive
                  let isBlocked=user?.isBlocked
                  if(isBlocked) res.send('you are blocked by admin');
                  if((!isBlocked)&&(isActive))
                  {
                    req.user=user
                    next();
                  } 
                  else res.render('user/otp',{user});
                }
            })
        }
        else {
           res.render('user/signin');
        }

    }
}