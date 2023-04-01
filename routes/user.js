const express=require('express'); 
const router =  express.Router();
const auth=require('../controllers/userAuth');
const controller=require('../controllers/userController');
const helper=require('../Helpers/userHelpers')


router.get('/',auth.cheakUser,controller.index);
router.get('/otp',auth.cheakUser,controller.otp)
router.get('/login',auth.isuser,controller.login);
router.get('/allproductpage',auth.cheakUser,controller.shop);
router.get('/logout',controller.logout);
router.get('/singleProduct/:id',auth.cheakUser,controller.productdisc);
router.get('/profile/:id',auth.isAuth,controller.profile);
router.get('/cart/:id',auth.isAuth,controller.showCart);
router.get('/editprofile/:id',auth.isAuth,controller.editpage);
router.get('/search',auth.cheakUser,controller.search);
router.get('/resendotp',controller.resendOtp);
router.get('/cartInc',auth.isAuth,controller.incrimentQuantity);
router.get('/wishlist',auth.isAuth,controller.showWishlist)
router.get('/addTocart',auth.isAuth,controller.addCartfromWishlist)
router.get('/removeWishlist',auth.isAuth,controller.removeWishlist)
router.get('/cheackout',auth.isAuth,controller.showCheakout);
router.get('/orders',auth.isAuth,controller.viewOrders)
router.get('/orderConformation',auth.isAuth,controller.showConformpage)
router.get('/viewOrderdProducts',auth.isAuth,controller.showOrderdProducts)
router.get('/removeAdress',auth.isAuth,controller.removeAdress)
router.get('/updateAdress',auth.isAuth,controller.showUpdate)
router.get('/cancelOrder',auth.isAuth,controller.cancelOrder);
router.get('/changePassword',auth.isAuth,controller.showPasswordForm)
router.get('/returnOrder',auth.isAuth,controller.returnOrder)
router.get('/forgotPassword',controller.enterMail)
router.get('/changePassword',controller.changePasswordForm)
router.get('/otpPasswordChange',controller.showOtp)

router.post('/placeOrder',auth.isAuth,controller.placeOrder);
router.post('/signUp',controller.signUp);
router.post('/verifyotp/:id',controller.verifyotp,controller.changeStatus);
router.post('/updateAdress',auth.isAuth,controller.updateAdress)
router.post('/profileUpload',auth.isAuth,helper.profileUpload,controller.updateProfile)
router.post('/isEmail',auth.cheakUser,controller.isEmail)
router.post('/login',controller.isveryfied);
router.post('/addCart',auth.isAuth,controller.addToCart);
router.post('/addAdress',auth.isAuth,controller.addAdress);
router.post('/addToWishlist',auth.isAuth,controller.addwishlist);
router.post('/removeCart',auth.isAuth,controller.removeCart);
router.post('/couponValidate',auth.isAuth,controller.couponValidate)
router.post('/verifyOnline',auth.isAuth,controller.verifyOnlinePayment)
router.post('/review',auth.isAuth,controller.addReview)
router.post('/editDetails',auth.isAuth,controller.updateDetails)
router.post('/changePasswordOtp/:email',controller.verifyotp,controller.showChangePasswordForm);
router.post('/changePassword',controller.changePassword)

module.exports=router;