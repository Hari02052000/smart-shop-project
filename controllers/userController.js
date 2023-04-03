const userModel=require('../models/userSchema')
const categoryModel=require('../models/categorySchema');
const productModel=require('../models/productSchema');
const orderModel=require('../models/orderSchema');
const couponModel=require('../models/couponSchema');
const reviewModel=require('../models/reviewSchema');
const bannerModel=require('../models/banner');
const Helpers=require('../Helpers/userHelpers');
const jwt=require('jsonwebtoken');
const eoverify=require('eoverify');
const Razorpay=require('razorpay');
const cloudinary=require('../Helpers/cloudinary');
const bcrypt=require('bcrypt');
const objectid=require('mongoose').Types.ObjectId


const maxage=3*24*60*60;
const createToken=(id)=>{
   return jwt.sign({id},'key1',{expiresIn:maxage})
}

let otp1=undefined

const couponStore={
  id:undefined,
  discount:undefined,
  maxAmount:undefined
}
let instance = new Razorpay({
  key_id:process.env.razorpay_key_id,
  key_secret:process.env.razorpay_key_secret
});


module.exports={
    index:async(req,res)=>{
      try{
      let user=req.user
      let banners=await bannerModel.find({listed:true})
      let products=await productModel.find({listed:true}).limit(8)
       res.render('user/home',{user,banners,products});}
       catch(err){
        res.send(err)
       }
    },
    login:(req,res)=>{
      try{
        res.render('user/signin')}
        catch(err){
          res.send(err)
        }
    },
    signUp:async (req,res)=>{
      
       try {const{username,password,confPassword,email,phone}=req.query
        const user=await userModel.create({username,password,confPassword,email,phone});
      const token=createToken(user._id);
      res.cookie('jwt',token,{maxage:maxage, httpOnly:true})
      //sending otp to mailid
      const otp=eoverify.sendOtp(email);
      otp1=otp.otp
      res.json({userCreated:true})
    
      }
      catch(err){
        let errors= Helpers.handleErrors(err);
      res.json({errors})
      }
        
    },
    otp:(req,res)=>{
      try{
      let user=req.user
      res.render('user/otp',{user});}
      catch(err){
        res.send(err)
      }
    },
    verifyotp:(req,res,next)=>{
     let otp=req.body.otp
     let id=req.params.id
     let email=req.params.email
     if(otp==otp1) {
      req.id=id
      req.email=email
        next();
     }
    else res.send('not verifyed'); 
    
    },
    changeStatus:async(req,res)=>{
      let id=req.id
      await userModel.findByIdAndUpdate({ _id: id }, { $set: { isActive: true } });
      res.redirect('/')
    },
    resendOtp:(req,res)=>{
      let email=req.query.q
      const otp=eoverify.sendOtp(email);
      otp1=otp.otp
      res.redirect('back')  
    },
   shop:async(req,res)=>{
    try{
    const user=req.user
    const products= await productModel.find({status:true}).populate({ path: 'category',
    select: 'category'})
    const category= await categoryModel.find()
     res.render('user/allProducts',{products,category,user})}
     catch(err){
      res.send(err);
     }
   },
   isveryfied:async (req,res)=>{
    try{
    const{email,password}=req.query
    const user=await userModel.findOne({email:email});
    if(!user){ res.json({err:'incorrect email or password'})
             return; }
   else{
    const match=await bcrypt.compare(password,user.password)
    if(match){
      const token=createToken(user._id);
      res.cookie('jwt',token,{httpOnly:true})
      res.json({logedin:true})
    }
    else {
      res.json({err:'incorrect email or password'})
             return;
    };
   }
  }
  catch(err){
    res.json({err:err});
  }
   },
   logout:(req,res)=>{
   res.cookie('jwt','',{maxAge:1});
   res.redirect('/');
   },
   enterMail:(req,res)=>{
    res.render('user/forgotPassword');
   },
   productdisc:async(req,res)=>{
    try{
    let user=req.user
    let id=req.params.id
    const product= await productModel.findOne({_id:id});
    const review=await reviewModel.find({product:id}).populate('user')
    res.render('user/singleProduct',{user,product,review})}
    catch(err){
      res.send(err);
    }
   },
   profile:async (req,res)=>{
   const userid= req.params.id
  const user= await userModel.findOne({_id:userid})
    res.render('user/profile',{user});
   },
   addToCart:async(req,res)=>{
    try{
    let productid=req.query.q
    let user =req.user
    let userid=user._id
    if(user){
      let product= await userModel.findOne({_id:userid,'cart.product':productid}).populate('cart.product')
      if(product){
        
 await userModel.updateOne({_id:userid,'cart.product':productid},
  { $inc: { 'cart.$.quantity': 1 }})
              
      }
    else{
    await userModel.updateOne({_id:userid},{$addToSet:{cart:{product:objectid(productid)}}})}
    res.json({added:true})
    }
    else{
      res.json({err:'you are not user'});
    }}
    catch(err){
      res.json({err})
    }

   },
   incrimentQuantity:async (req,res)=>{
    try{
    let product=req.query.product
    let action=req.query.action
    let inc
    if (action=='add') inc=1
    if(action=='sub') inc=-1
    let user=req.user
    let userid=user._id
    
   let updated=await userModel.updateOne({_id:userid,'cart.product':product},
  { $inc: { 'cart.$.quantity': inc } })

  res.json({update:true})}
  catch(err){
    res.json({err})
  }

  
  
  
   },
   
   showCart:async(req,res)=>{
    try{
    let id=req.params.id
    let user=req.user
   let usercart=await userModel.findOne({_id:id}).populate('cart.product')
    usercart.cart.forEach(element => {
      element.product.newprice=element.quantity*(element.product.price)
      
    });
    
    
    const sum = usercart.cart.reduce((acc, item) => acc + item.product.newprice, 0);
    usercart.totel=sum
    res.render('user/cart',{usercart,user})}
    catch(err){
      res.send(err)
    }
    
   },
   editpage:(req,res)=>{
    try{
    let user=req.user
    res.render('user/editprofile',{user},);}
    catch(err){
      res.send(err)
    }
   },
   search:async(req,res)=>{
    try{
const limit=10
let page=req.query.page
page=parseInt(page)
page=page-1
const search=req.query.q;
let category=req.query.category
const sort=req.query.sort


const searchquery={listed:true}
if(search!='undefined'){
  searchquery.$or=[{
    productName:{$regex:search,$options:"i"}}]
}

if((category!='undefined')&&(category!='All')){

searchquery.category=category

}
let sortby
sort=='asc'?sortby=1:sortby=-1

const products=await productModel.find(searchquery).populate('category').sort({'price':sortby}).skip(page*limit).limit(limit)
let totelpage=await productModel.find(searchquery).populate('category').sort({'price':sortby}).count()
totelpage=Math.ceil(totelpage/limit)

res.send({products,totelpage})}
catch(err){
  res.send(err)
}

 
  
   },
   addAdress:async(req,res)=>{
    try{
    let user=req.user
    const{name,house,city,zip}=req.body
   let users= await userModel.updateOne({_id:user._id},{$addToSet:{adress:{name,house,city,zip}}})
   res.redirect('back')}
   catch(err){
    res.send(err)
   }
   },
   addwishlist:async(req,res)=>{
    try{
   let productid=req.query.q
   let user=req.user
   if(user){
   let prodect=await userModel.findOne({_id:user._id,'wishlist.product':productid})
  if(!prodect){
  
  let updated=  await userModel.updateOne({_id:user._id},{$addToSet:{wishlist:{product:objectid(productid)}}})
res.json({added:true});
  }
  else res.json({isWishlist:true})
  
  
  }}
  catch(err){
    res.json(err)
  }
   },

  showWishlist:async(req,res)=>{
    try{
    let user=req.user
    let userWishlist=await userModel.findOne({_id:user._id}).populate('wishlist.product');
    let wishList=userWishlist.wishlist;
    res.render('user/wishList',{wishList,user});}
    catch(err){
      res.send(err)
    }
  },

  removeCart:async(req,res)=>{
   let id= req.query.product
   let user=req.user
   try{
    await userModel.updateOne({_id:user._id},{$pull:{cart:{product:id}}})
    res.redirect('back')
   }
   catch(err){
    res.send(err)
   }
  },
  showCheakout:async(req,res)=>{
    try{
    let user=req.user 
    let usercart=await userModel.findOne({_id:user._id}).populate('cart.product')
    if(usercart.cart.length!=0){
    usercart.cart.forEach(element => {
      element.product.newprice=element.quantity*(element.product.price)
      
    });
    
    
    const sum = usercart.cart.reduce((acc, item) => acc + item.product.newprice, 0);
    usercart.totel=sum


    res.render('user/cheakout',{usercart,user})}
    else{
      res.redirect('/allproductpage')
    }
  }
  catch(err){
    res.send(err)
  }
  },
  addCartfromWishlist:async(req,res)=>{
       
   try{
    let productid=req.query.id
    let user =req.user
    let userid=user._id
    if(user){
      let product= await userModel.findOne({_id:userid,'cart.product':productid}).populate('cart.product')
      if(product){
        
 await userModel.updateOne({_id:userid,'cart.product':productid},
  { $inc: { 'cart.$.quantity': 1 }})
        
      
      }
    else{
    await userModel.updateOne({_id:userid},{$addToSet:{cart:{product:objectid(productid)}}})}
    //remove prodectid from wishlist
    await userModel.updateOne({_id:user._id},{$pull:{wishlist:{product:productid}}})
    res.json({ok:true});
    }
    else{
      res.send('you are not a user')
    }
   }
   catch(err){
    res.send(err)
   }
    

  },

  removeWishlist:async(req,res)=>{
    let id= req.query.id
   let user=req.user
   try{
    await userModel.updateOne({_id:user._id},{$pull:{wishlist:{product:id}}})
    res.json({wishListRemove:true})
   }
   catch(err){
    console.json({err})
   }
  },

  placeOrder:async(req,res)=>{
    try{
    let newOrder
    let coupon=null
    let{adress,paymentOption,couponid,wallet}=req.query;
    const userId=req.user._id
let usercart=await Helpers.findCartTotel(userId)
   let deliveryAdress= usercart.adress.find(a=>a._id==adress)
   deliveryAdress=`name:${deliveryAdress.name},${deliveryAdress.house}(house),${deliveryAdress.city}(city),${deliveryAdress.zip}(zip)`
 
 const products=[...usercart.cart]
 if(couponStore.id==couponid){
  let actualPrice=parseFloat(usercart.totel)
  let discountPercentage=parseFloat(couponStore.discount)
  let maxAmount=parseFloat(couponStore.maxAmount)
  
  let price=actualPrice*(discountPercentage/100)
  let discount=actualPrice-price
  let maxDiscount=actualPrice-maxAmount
  if(discount<=maxDiscount){
    usercart.totel=discount
  }
  if(discount>maxDiscount){
    usercart.totel=maxDiscount
  }
coupon=couponid
couponStore.id=undefined
couponStore.discount=undefined
couponStore.maxAmount=undefined
couponid=undefined
 }

if(wallet=='useWallet'){
   let actualPrice=usercart.totel
   let myWallet=parseFloat(usercart.wallet)
   let takedWallet=undefined
   if((myWallet>=actualPrice)&&(myWallet>0)){
    myWallet-actualPrice
    usercart.totel=0
     takedWallet=actualPrice
    usercart.takedWallet=takedWallet
    takedWallet=undefined
   }
   if((myWallet<actualPrice)&&(myWallet>0)){
    let reducedPrice=actualPrice-myWallet
  
   usercart.totel=reducedPrice
    takedWallet=actualPrice-reducedPrice
   usercart.takedWallet=takedWallet
   takedWallet=undefined
   }
   
    if(usercart.takedWallet){
    await userModel.findOneAndUpdate({_id:userId},{ $inc: { wallet: -(usercart.takedWallet) } })
    }

   
    
}
  
 if((paymentOption=='online')||(paymentOption=='cod')){
  newOrder=await orderModel.create({products,user:userId,totelAmount:usercart.totel,paymentOption,date:Date.now(),coupon, billingAdress:deliveryAdress,payedAmoundFromWallet:usercart.takedWallet})
           if(usercart.totel==0){
            await userModel.findOneAndUpdate({_id:userId},{$set:{cart:[]}})
            res.json({allFromWallet:true})
            return;
          }
          else{

    if(paymentOption=='cod'){
      
    await userModel.findOneAndUpdate({_id:userId},{$set:{cart:[]}})

    res.json({methode:'cod'})
  }
  if(paymentOption=='online'){


    let options = {
      amount: usercart.totel,  
      currency: "INR",
      receipt: ""+newOrder._id
    };
    instance.orders.create(options, function(err, order) {
      if(err) res.json({err})
      res.json({methode:'online',order:order})
    });
  }
 }


          }
        }
        catch(err){
          res.json({err})
        }     
  },

viewOrders:async(req,res)=>{
  try{
  let user=req.user
let orderDetails=await orderModel.find({user:user._id}).populate('products.product').sort({date:-1})

res.render('user/orderDetails',{orderDetails,user})}
catch(err){
  res.send({err})
}
},
couponValidate:async(req,res)=>{
  try{
  let couponid=req.query.id
  let coupon=await couponModel.findOne({couponId:couponid})
  let user=req.user
  if(!coupon) res.json({err:'couponNotFound'})
  else{
    const currentDate= Date.now()
    if(currentDate>coupon.expiryDate){
       res.json({err:'coupon expaired'})
       return
      } 
    if(!coupon.status){ 
      res.json({err:'coupon expiared'})
      return}
    if(coupon.userAllowed<coupon.claimedUsers){ 
      res.json({err:'allowed users over'})
    return}
    let usercart=Helpers.findCartTotel
    if(coupon.minimumPurchase>usercart.totel) {
      res.json({err:`you nedd to purchaise above ${coupon.minimumPurchase} to active this coupon`})
   return}
  await couponModel.findOneAndUpdate({couponId:couponid},{ $inc: { claimedUsers:1 } })
couponStore.id=coupon.couponId
couponStore.discount=coupon.discount
couponStore.maxAmount=coupon.maxAmount
    res.json({validated:true,discount:coupon.discount,maxAmount:coupon.maxAmount})
    
  }}
  catch(err){
    console.json({err})
  } 
},
verifyOnlinePayment:async(req,res)=>{
  try{
  let user=req.user
  const{response,order}=req.body
  const crypto=require('crypto')
  let hmac=await crypto.createHmac('sha256','O4RlOXRxnLAX8IaXM3ifqFZZ')
  await hmac.update(response.razorpay_order_id+'|'+response.razorpay_payment_id)
  hmac=await hmac.digest('hex')
  if(hmac==response.razorpay_signature){
    await orderModel.findOneAndUpdate({_id:order.receipt},{$set:{paymentStatus:'payed'}})
    await userModel.findOneAndUpdate({_id:user._id},{$set:{cart:[]}})

    //update order status and clear usercart
    res.json({paymet:true})
  }
  else{
    res.json({payment:'failed'})
  }
}
catch(err){
  res.json({err})
}

},
showConformpage:(req,res)=>{
  res.render('user/orderConformation')
},
showOrderdProducts:async(req,res)=>{
  try{
  let user=req.user
  let id=req.query.q
  let orderdProducts=await orderModel.findOne({_id:id}).populate('products.product')
  orderdProducts=orderdProducts.products
  res.render('user/orderdProducts',{orderdProducts,user})}
  catch(err){
    res.send(err)
  }
},

removeAdress:async(req,res)=>{
  try{
  let user=req.user
  let adress=req.query.q
  await userModel.updateOne({_id:user._id},{$pull:{adress:{_id:adress}}})
    res.redirect('back')
  }
  catch(err){
    res.send(err)
  }


},
showUpdate:async(req,res)=>{
  try{
  let adressId=req.query.id
  let user=req.user
 let adress= user.adress.find(a=>a._id==adressId)
  res.send(adress)}
  catch(err){
    res.send(err)
  }
},
updateAdress:async(req,res)=>{
  try{
  let user=req.user
  let adressid=req.query.id
  const {name,house,city,zip}=req.body
  let newuser=await userModel.updateOne({_id:user._id,'adress._id': adressid },
  { $set: { 'adress.$': {name,house,city,zip} } })

res.redirect('back')}
catch(err){
  res.send(err)
}
},
cancelOrder:async(req,res)=>{
  try{
  let orderid=req.query.q
  let order=await orderModel.findOneAndUpdate({_id:orderid},{$set:{orderStatus:'canceld'}})
  let userid=req.user._id
  let totelAmount=order.totelAmount
  if(order.paymentStatus=='payed'){
  let user=await userModel.findOneAndUpdate({_id:userid},{ $inc: { wallet: totelAmount } })
  let order= await orderModel.findOneAndUpdate({_id:orderid},{$set:{paymentStatus:'added wallet'}})

  
}
res.send({canceld:true})
  }
  catch(err){
    res.send(err)
  }

},
addReview:async(req,res)=>{
  try{
  let user=req.user
  let{productid,review,rating}=req.query
  rating=parseFloat(rating)
  if(isNaN(rating)){
     res.json({err:'rating must be a number'})
    return;
  }
  if(rating>5){
    res.json({err:'maximum value of rating is 5'})
    return;
  }
  let order=await orderModel.find(
    { 
      user: user._id, 
      'products.product': productid,
      orderStatus:'deliverd'
    }
  )
  if(order.length!=0){

    await reviewModel.create({product:productid,user:user._id,rating,review})
   res.json({created:true})
   return;
  }
  else{
     res.json({err:'you can only provide review and rating after delivery'})
     return;
  }
}
catch(err){
  res.json({err})
}
},
updateDetails:async(req,res)=>{
 const{email,phone,username,id}=req.query
 try{
  await userModel.findOneAndUpdate({_id:id},{$set:{email,phone,username}})
  res.json({updated:true})
 }
 catch(err){
  
    res.json({err:err.keyPattern})
    
 }
},
showPasswordForm:(req,res)=>{
try{
  let user=req.user
  res.render('user/changePassword',{user})}
  catch(err){
    res.send(err)
  }
},
returnOrder:async(req,res)=>{
  try{
  let orderid=req.query.q
  let order=await orderModel.findOne({_id:orderid})
 const deliverdDate= order.deliverdDate
 let twoWeeksAfter =deliverdDate
 twoWeeksAfter. setDate(deliverdDate.getDate() + 7 * 2);
const dateNow=  new Date();
 if (dateNow < twoWeeksAfter) {
  await orderModel.updateOne({_id:orderid},{$set:{orderStatus:'return'}})
  res.json({returned:true})

} 
else{
  res.json({err:'you canot return the product after 2 weeks'})
}

  }
  catch(err){
    res.json({err})
  }
  
  
},
isEmail:async(req,res)=>{
  try{
  let email=req.query.email
  let user=await userModel.findOne({email:email})
  if(user){
    const otp=eoverify.sendOtp(user.email);
    otp1=otp.otp
    res.json({isEmail:true,user})}
  else{
    res.json({isEmail:false})

  }}
  catch(err){
    res.json({err})
  }
},
changePasswordForm:(req,res)=>{
  res.render('user/changePassword')
},
showOtp:(req,res)=>{
  let email=req.query.email
  res.render('user/passwordChangeOtp',{email})
},
showChangePasswordForm:(req,res)=>{
  let email=req.email
  res.render('user/changePassword',{email})
},
changePassword:async(req,res)=>{
  try{
 let email=req.query.email
 let password=req.query.password
password= await bcrypt.hash(password,12);
 await userModel.findOneAndUpdate({email:email},{$set:{password:password}})
 res.json({updated:true})}
 catch(err){
  res.json({updated:false})
 }
},
updateProfile:async(req,res)=>{
  try{
  const user=req.user
  let result=await cloudinary.uploadImage(req.file.path)
        let url=result.secure_url
        let cloudinaryid=result.public_id
  let profile=url
  let profileId=cloudinaryid
  await userModel.findOneAndUpdate({_id:user._id},{$set:{profile,profileId}});
  res.json({uploaded:true})}
  catch{
    res.json({uploaded:false})
  }
} 
    
}