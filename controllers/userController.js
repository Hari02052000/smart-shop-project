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
      console.log(user);
      const token=createToken(user._id);
      res.cookie('jwt',token,{maxage:maxage, httpOnly:true})
      //sending otp to mailid
      const otp=eoverify.sendOtp(email);
      otp1=otp.otp
      console.log(otp1)
      res.json({userCreated:true})
    
      }
      catch(err){
        let errors= Helpers.handleErrors(err);
        console.log(errors)
      res.json({errors})
      }
        
    },
    otp:(req,res)=>{
      try{
      let user=req.user
      console.log(user)
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
      console.log(otp1)
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
     console.log(review)
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
    }

   },
   incrimentQuantity:async (req,res)=>{
    let product=req.query.product
    let action=req.query.action
    console.log(action)
    let inc
    if (action=='add') inc=1
    if(action=='sub') inc=-1
    let user=req.user
    let userid=user._id
    
   let updated=await userModel.updateOne({_id:userid,'cart.product':product},
  { $inc: { 'cart.$.quantity': inc } })

  res.send('updated')

  
  
  
   },
   decrimentQuantity:async (req,res)=>{
    let product=req.query.prodect
    let user=req.user
    let userid=user._id
    await userModel.updateOne({_id:userid,'cart.product':product},
  { $inc: { 'cart.$.quantity': -1 }})
  res.redirect('back')
   },
   showCart:async(req,res)=>{
    let id=req.params.id
    let user=req.user
   let usercart=await userModel.findOne({_id:id}).populate('cart.product')
   console.log(usercart.cart)
    usercart.cart.forEach(element => {
      element.product.newprice=element.quantity*(element.product.price)
      
    });
    
    
    const sum = usercart.cart.reduce((acc, item) => acc + item.product.newprice, 0);
    usercart.totel=sum
    res.render('user/cart',{usercart,user})
    
   },
   editpage:(req,res)=>{
    let user=req.user
    res.render('user/editprofile',{user},);
   },
   search:async(req,res)=>{
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
    productName:{$regex:search,$options:"i"}},
   {brand:{$regex:search,$options:"i"}}]
}

if((category!='undefined')&&(category!='All')){

searchquery.category=category

}
let sortby
sort=='asc'?sortby=1:sortby=-1

const products=await productModel.find(searchquery).populate('category').sort({'price':sortby}).skip(page*limit).limit(limit)
let totelpage=await productModel.find(searchquery).populate('category').sort({'price':sortby}).count()
totelpage=Math.ceil(totelpage/limit)

res.send({products,totelpage})

 
  
   },
   addAdress:async(req,res)=>{
    let user=req.user
    const{name,house,city,zip}=req.body
   let users= await userModel.updateOne({_id:user._id},{$addToSet:{adress:{name,house,city,zip}}})
   res.redirect('back')
   },
   addwishlist:async(req,res)=>{
   let productid=req.query.q
   let user=req.user
   if(user){
   let prodect=await userModel.findOne({_id:user._id,'wishlist.product':productid})
  if(!prodect){
  
  let updated=  await userModel.updateOne({_id:user._id},{$addToSet:{wishlist:{product:objectid(productid)}}})
res.json({added:true});
  }
  else res.json({isWishlist:true})
  
  
  }
   },

  showWishlist:async(req,res)=>{
    let user=req.user
    let userWishlist=await userModel.findOne({_id:user._id}).populate('wishlist.product');
    let wishList=userWishlist.wishlist;
    res.render('user/wishList',{wishList,user});
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
    
    let user=req.user 

    let usercart=await userModel.findOne({_id:user._id}).populate('cart.product')
    if(usercart.cart.length!=0){
    console.log(usercart);
    usercart.cart.forEach(element => {
      element.product.newprice=element.quantity*(element.product.price)
      
    });
    
    
    const sum = usercart.cart.reduce((acc, item) => acc + item.product.newprice, 0);
    usercart.totel=sum

    console.log(usercart);

    res.render('user/cheakout',{usercart,user})}
    else{
      res.redirect('/allproductpage')
    }

  },
  addCartfromWishlist:async(req,res)=>{
       

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

    

  },

  removeWishlist:async(req,res)=>{
    let id= req.query.id
   let user=req.user
   console.log(id)
   try{
    await userModel.updateOne({_id:user._id},{$pull:{wishlist:{product:id}}})
    res.json({wishListRemove:true})
   }
   catch(err){
    console.log(err)
   }
  },

  placeOrder:async(req,res)=>{
    let newOrder
    let coupon=null
    let{adress,paymentOption,couponid,wallet}=req.query;
    console.log(adress,paymentOption,couponid,wallet)
    console.log(wallet)
    console.log(typeof(wallet))
    
    const userId=req.user._id
    console.log(adress,paymentOption,couponid)
let usercart=await Helpers.findCartTotel(userId)
   console.log(usercart.totel)
   let deliveryAdress= usercart.adress.find(a=>a._id==adress)
   deliveryAdress=`name:${deliveryAdress.name},${deliveryAdress.house}(house),${deliveryAdress.city}(city),${deliveryAdress.zip}(zip)`
 
 console.log(deliveryAdress)
 const products=[...usercart.cart]
 console.log(couponStore.id)
 console.log(couponid)
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
  console.log(usercart.totel)
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
  console.log(newOrder)
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


    var options = {
      amount: usercart.totel,  
      currency: "INR",
      receipt: ""+newOrder._id
    };
    instance.orders.create(options, function(err, order) {
      if(err) console.log(err)
      res.json({methode:'online',order:order})
    });
  }
 }


          }
         
  },

viewOrders:async(req,res)=>{
  let user=req.user
let orderDetails=await orderModel.find({user:user._id}).populate('products.product').sort({date:-1})

res.render('user/orderDetails',{orderDetails,user})
},
couponValidate:async(req,res)=>{
  try{
  let couponid=req.query.id
  console.log(couponid)
  let coupon=await couponModel.findOne({couponId:couponid})
  let user=req.user
  if(!coupon) res.json({err:'couponNotFound'})
  else{
    console.log(coupon)
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
    console.log(err)
  } 
},
verifyOnlinePayment:async(req,res)=>{
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
  console.log(req.body);

},
showConformpage:(req,res)=>{
  res.render('user/orderConformation')
},
showOrderdProducts:async(req,res)=>{
  let user=req.user
  let id=req.query.q
  let orderdProducts=await orderModel.findOne({_id:id}).populate('products.product')
  console.log(orderdProducts)
  orderdProducts=orderdProducts.products
  res.render('user/orderdProducts',{orderdProducts,user})
},

removeAdress:async(req,res)=>{
  console.log('ok')
  let user=req.user
  let adress=req.query.q
  console.log(adress)
  console.log(user._id)
  await userModel.updateOne({_id:user._id},{$pull:{adress:{_id:adress}}})
    res.redirect('back')


},
showUpdate:async(req,res)=>{
  let adressId=req.query.id
  let user=req.user
 let adress= user.adress.find(a=>a._id==adressId)
  console.log(adress);
  res.send(adress)
},
updateAdress:async(req,res)=>{
  let user=req.user
  let adressid=req.query.id
  const {name,house,city,zip}=req.body
  let newuser=await userModel.updateOne({_id:user._id,'adress._id': adressid },
  { $set: { 'adress.$': {name,house,city,zip} } })
  console.log(newuser)

res.redirect('back')
},
cancelOrder:async(req,res)=>{
  let orderid=req.query.q
  let order=await orderModel.findOneAndUpdate({_id:orderid},{$set:{orderStatus:'canceld'}})
  let userid=req.user._id
  let totelAmount=order.totelAmount
  if(order.paymentStatus=='payed'){
  let user=await userModel.findOneAndUpdate({_id:userid},{ $inc: { wallet: totelAmount } })
  let order= await orderModel.findOneAndUpdate({_id:orderid},{$set:{paymentStatus:'added wallet'}})

  
}
res.send({canceld:true})

},
addReview:async(req,res)=>{
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
},
updateDetails:async(req,res)=>{
 console.log(req.query)
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
  console.log('hi')
  let user=req.user
  res.render('user/changePassword',{user})
},
returnOrder:async(req,res)=>{
  let orderid=req.query.q
  console.log(orderid)
  let order=await orderModel.findOne({_id:orderid})
 const deliverdDate= order.deliverdDate
 let twoWeeksAfter =deliverdDate
 twoWeeksAfter. setDate(deliverdDate.getDate() + 7 * 2);
const dateNow=  new Date();
console.log(dateNow)
 if (dateNow < twoWeeksAfter) {
  await orderModel.updateOne({_id:orderid},{$set:{orderStatus:'return'}})
  console.log('return ok')
  res.json({returned:true})

} 
else{
  console.log('2 week over')
  res.json({err:'you canot return the product after 2 weeks'})
}


  
  
},
isEmail:async(req,res)=>{
  let email=req.query.email
  console.log(email)
  let user=await userModel.findOne({email:email})
  console.log(user)
  if(user){
    const otp=eoverify.sendOtp(user.email);
    otp1=otp.otp
    console.log(otp1)
    res.json({isEmail:true,user})}
  else{
    res.json({isEmail:false})

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
 let email=req.query.email
 let password=req.query.password
password= await bcrypt.hash(password,12);
 await userModel.findOneAndUpdate({email:email},{$set:{password:password}})
 res.json({updated:true})
},
updateProfile:async(req,res)=>{
  const user=req.user
  let profile=req.file.filename
  await userModel.findOneAndUpdate({_id:user._id},{$set:{profile}});
  res.json({uploaded:true})
} 
    
}