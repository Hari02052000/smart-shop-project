const express=require('express');
const controller=require('../controllers/adminController');
const router=express.Router();
const helper=require('../Helpers/adminHelpers');
const auth=require('../controllers/adminAuth');


router.get('/',auth.isAdmin,controller.showhome);
router.get('/allproduct',auth.isAdmin,controller.products);
router.get('/addproductpage',auth.isAdmin,controller.addProductPage);
router.get('/allcategory',auth.isAdmin,controller.allCategory);
router.get('/addCategory',auth.isAdmin,controller.showCategory);
router.get('/alluser',auth.isAdmin,controller.showuser);
router.get('/adminlogout',controller.logout);
router.get('/editproductpage/:id',auth.isAdmin,controller.editproductpage)
router.get('/coupons',auth.isAdmin,controller.showCoupons)
router.get('/addCoupons',auth.isAdmin,controller.showCouponPage)
router.get('/deleateImage',auth.isAdmin,controller.deleteImage)
router.get('/editcoupon/:id',auth.isAdmin,controller.showEditCoupon)
router.get('/orders',auth.isAdmin,controller.viewOrders)
router.get('/sales',auth.isAdmin,controller.showSales);
router.get('/manageOrder',auth.isAdmin,controller.manageOrder);
router.get('/banner',auth.isAdmin,controller.showBanner);
router.get('/addBanner',auth.isAdmin,controller.addBannerForm)
router.get('/editBanner/:id',auth.isAdmin,controller.showBannerEdit)

router.post('/login',controller.login);
router.post('/addCatogery',auth.isAdmin,helper.uploadCategory,controller.addCategory);
router.post('/addproduct',auth.isAdmin,helper.uploadProducts,controller.addProducts);
router.post('/blockUser',auth.isAdmin,controller.blockUser);
router.post('/unblockUser',auth.isAdmin,controller.unblockUser);
router.post('/editCategory/:id',auth.isAdmin,controller.editCategory);
router.post('/addCoupon',auth.isAdmin,controller.addCoupon);
router.post('/updateCategory',auth.isAdmin,helper.uploadCategory,controller.updateCatogery);
router.post('/unlistProduct/:id',auth.isAdmin,controller.unlistProdect);
router.post('/listProduct/:id',auth.isAdmin,controller.listProdect);
router.post('/updateProduct',auth.isAdmin,helper.uploadProducts,controller.updateProduct)
router.post('/deactive',auth.isAdmin,controller.deactiveCoupon)
router.post('/active',auth.isAdmin,controller.activeCoupon)
router.post('/getSales',auth.isAdmin,controller.getSales)
router.post('/updateOrder',auth.isAdmin,controller.updateOrder)
router.post('/cancelOrder',auth.isAdmin,controller.cancelOrder)
router.post('/addBanner',auth.isAdmin,helper.uploadBanner,controller.createBanner)
router.post('/UpdateCoupon',auth.isAdmin,controller.updateCoupon)
router.post('/unlistBanner/:id',auth.isAdmin,controller.unlistbanner)
router.post('/listBanner/:id',auth.isAdmin,controller.listbanner)
router.post('/editBanner',auth.isAdmin,helper.uploadBanner,controller.updateBanner)





module.exports=router