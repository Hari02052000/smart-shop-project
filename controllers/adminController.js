
const categoryModel=require('../models/categorySchema');
const productModel=require('../models/productSchema');
const userModel=require('../models/userSchema');
const adminModel=require('../models/adminSchema');
const couponModel=require('../models/couponSchema');
const orderModel=require('../models/orderSchema');
const bannerModel=require('../models/banner');
const helpers=require('../Helpers/adminHelpers')
const jwt=require('jsonwebtoken');
const bcrypt=require('bcrypt');
const Excel = require('exceljs');
const PDFDocument=require('pdfkit-table');
const cloudinary=require('../Helpers/cloudinary');
const { json } = require('body-parser');





const maxage1=3*24*60*60*60;
const createToken=(id)=>{
   return jwt.sign({id},'key2',{expiresIn:maxage1})
}

module.exports={
    showhome:async(req,res)=>{
        try{
     let totelUsers=await userModel.find().count()
     let blockedUsers=await userModel.find({isBlocked:true}).count()
     let totelOrders=await orderModel.find().count()
     let canceldOrders=await orderModel.find({orderStatus:'canceld'}).count()
     let revenue= await orderModel.aggregate([
                {$match:{orderStatus:'deliverd'}},
                {$group:{_id:null,totel:{$sum:'$totelAmount'}}}
             ])
    const products = await productModel.find().populate('category');
    const categoryCounts = products.reduce((acc, curr) => {
      const categoryName = curr.category.category;
      if (acc[categoryName]) {
        acc[categoryName]++;
      } else {
        acc[categoryName] = 1;
      }
      return acc;
    }, {});
    let labels = Object.keys(categoryCounts);
    let data = Object.values(categoryCounts);
    let backgroundColors=helpers.generateBackgroundColors(labels.length)
    
    labels=JSON.stringify(labels)
    data=JSON.stringify(data)
    backgroundColors=JSON.stringify(backgroundColors)
    res.render('admin/home',{labels,data,backgroundColors,totelOrders,revenue,canceldOrders,totelUsers,blockedUsers})}
    catch(err){
        res.send(err);
    }
    },
    login:async (req,res)=>{
        try{
        const{email,password}=req.query
        const admin=await adminModel.findOne({email:email});
        if(!admin) {
            res.json({err:'invalid username or password'});
        return;}
       else{
        const match=await bcrypt.compare(password,admin.password)
        
        if(match){
          const token=createToken(admin._id);
          res.cookie('adminjwt',token,{maxAge:maxage1, httpOnly:true})
          res.json({login:true})
          return
         
        }
        res.json({err:'invalid username or password'})
        return
       }}
       catch(err){
        res.json({err:err})
       }
    
       },
       logout:(req,res)=>{
       res.cookie('adminjwt','',{maxAge:1});
       res.redirect('/admin');
       },

    products: async(req,res)=>{
        try{
        const products= await productModel.find().populate( { path: 'category',
        select: 'category'}
      )
        res.render('admin/viewproduct',{products})}
        catch(err){
            res.send(err)
        }
    },
    addProductPage:async (req,res)=>{
        try{
        const category=await categoryModel.find({listed:true})
        res.render('admin/addproduct',{category})}
        catch(err){
            res.send(err)
        }
    },
    allCategory:async (req,res)=>{
        try{
        const category=await categoryModel.find() 
        res.render('admin/allCategory',{category});}
        catch(err){
            res.send(err);
        }
    },
    showCategory:(req,res)=>{
        res.render('admin/addCategory');
    },
    addCategory:async (req,res)=>{
        
       try{ const categoryname= req.body.category
        let result=await cloudinary.uploadImage(req.file.path)
        let url=result.secure_url
        let cloudinaryid=result.public_id
        await categoryModel.create({category:categoryname,image:url,cloudinaryId:cloudinaryid});
        res.json({added:true});
    }
        catch(err){
            if(err.code==11000){ 
                res.json({err:'category name allredy exist'})
                 return;}
            else {
                res.json({err:`your err is ${err}`})
                 return}
        }

    },
    addProducts:async(req,res)=>{
        try{
        let{productName,category,description,price,stocks,brand,model,highlights}=req.body
        
         highlights=highlights.split(',');
        let images=await cloudinary.multifiles(req.files)
        await productModel.create({productName,category,description,price,stocks,brand,model,images,highlights})
        res.redirect('back');}
        catch(err){
            res.send(err);
        }
    },
    showuser:async(req,res)=>{
        try{
     const users=await userModel.find();
        res.render('admin/viewuser',{users});}
        catch(err){
            res.send(err)
        }
    },
    blockUser:async (req,res)=>{
        try{
     let id =req.query.id
     await userModel.findByIdAndUpdate({ _id: id }, { $set: { isBlocked: true } })
    res.redirect('/admin/alluser');}
    catch(err){
        res.send(err);
    }

    },
    unblockUser:async (req,res)=>{
        try{
        let id =req.query.id
        await userModel.findByIdAndUpdate({ _id: id }, { $set: { isBlocked: false } });
        res.redirect('/admin/alluser');}
        catch(err){
            res.send(err);
        }
        
    },
    
    editCategory:async(req,res)=>{
        try{
     const id=req.params.id
     let category= await categoryModel.findOne({_id:id})
     res.render('admin/editCategory',{category});}
     catch(err){
        res.send(err)
     }
    },
    editproductpage:async(req,res)=>{
        try{
        const id=req.params.id
        let products=await productModel.findOne({_id:id})
        let category= await categoryModel.find();
        res.render('admin/editProduct',{products,category})}
        catch(err){
            res.send(err);
        }
    },
    showCoupons:async(req,res)=>{
        try{
        const coupons=await couponModel.find()
        res.render('admin/allCoupons',{coupons})}
        catch(err){
            res.send(err);
        }
    },
    showCouponPage:async(req,res)=>{
        try{
           const coupons= await categoryModel.find()
        res.render('admin/addCoupon',{coupons})}
        catch(err){
            res.send('something went wrong ')
        }
    },
    addCoupon:async(req,res)=>{
        try{
    const{couponId,expiryDate,userAllowed,discount,minimumPurchase}=req.query
    await couponModel.create({couponId,expiryDate,userAllowed,discount,minimumPurchase})
    res.json({coupon:true})}
    
    catch(err){
        res.json({coupon:false});
    }
    },

    updateCatogery:async(req,res)=>{
        try{
        let id=req.query.q
       let category=req.body.category
        let catogerySchema=await categoryModel.findOneAndUpdate({_id:id},{$set:{category}})
        if(req.file){
           let path=req.file.path
          let imgid=catogerySchema.cloudinaryId
       let data=  await cloudinary.rename(path,imgid)
       await categoryModel.updateOne({_id:id},{$set:{image:data.secure_url}})
        
        }
       
       res.json({changed:true});
    }
       catch(err){
        res.json({err:'name allredy exist'})
       }
    },
    unlistProdect:async(req,res)=>{
        try{
        let id=req.params.id
        await productModel.findByIdAndUpdate({ _id: id }, { $set: { listed: false } })
        res.redirect('back')}
        catch(err){
            res.send(err);
        }

    },
    listProdect:async(req,res)=>{
        try{
        let id=req.params.id
        await productModel.findByIdAndUpdate({ _id: id }, { $set: { listed: true } })
        res.redirect('back')}
        catch(err){
            res.send(err);
        }

    },
    deleteImage:async(req,res)=>{
        try{
        let{productId,image}=req.query
       const product= await productModel.findOne({_id:productId})
      let removed= product.images.splice(image,1)
      let result=await cloudinary.deleteImage(removed[0].cloudinary_id)
       await product.save()
    
      res.json({imageRemoved:true})}
      catch(err){
        res.json({err});
      }
    },
    updateProduct:async(req,res)=>{
        try{
        let productId=req.query.id
        let updated=req.body
       let newProduct= await productModel.findOneAndUpdate({_id:productId},{$set:updated})
        if(req.files.length!=0){
         let image=await cloudinary.multifiles(req.files)
        newProduct.images=newProduct.images.concat(image)
           await newProduct.save()
          
           }
         res.redirect('/admin/allproduct')}
         catch(err){
            res.send(err);
         }
    },
    showEditCoupon:async(req,res)=>{
        try{
        let couponid=req.params.id
        let coupon= await couponModel.findOne({_id:couponid})
        res.render('admin/editCoupon',{coupon})}
        catch(err){
            res.send(err);
        }
    },
    deactiveCoupon:async(req,res)=>{
        try{
        let couponid=req.query.id
        await couponModel.findOneAndUpdate({_id:couponid},{$set:{status:false}})
        res.redirect('back')}
        catch(err){
            res.send(err);
        }

    },
    activeCoupon:async(req,res)=>{
        try{
        let couponid=req.query.id
        await couponModel.findOneAndUpdate({_id:couponid},{$set:{status:true}})
        res.redirect('back')}
        catch(err){
            res.send(err);
        }

    },
    viewOrders:async(req,res)=>{
        try{
        const allOrders=await orderModel.find().populate('products.product').sort({date:-1});
       
        res.render('admin/allOrders',{allOrders})}
        catch(err){
            res.send(err)
        }
        
    },
    showSales:(req,res)=>{

        res.render('admin/salesReport');
        
    },
    getSales:async(req,res)=>{
        try{
    
        let{fromDate,toDate,file}=req.body
        fromDate=new Date(fromDate).setHours(0,0,0)
        toDate=new Date(toDate).setHours(23,59,59)
        let orders=await orderModel.find({date: {
            $gte: fromDate,
            $lte: toDate,
          }}).populate('products.product');
       if(file=='excel'){
        const workbook = new Excel.Workbook();
        const worksheet = workbook.addWorksheet('SalesReport');
        worksheet.addRow(['Order id', 'billingAdress', 'Total','payment methode','date','order status','payment status']);
        orders.forEach(order => {
            worksheet.addRow([order._id, order.billingAdress, order.totelAmount,order.paymentOption,order.date.toLocaleDateString(),order.orderStatus,order.paymentStatus]);
          });

        
        worksheet.columns.forEach(column => {
            column.width = 30;
          });
    
          res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
          res.setHeader('Content-Disposition', 'attachment; filename=SalesReport.xlsx');
          return workbook.xlsx.write(res);
       }
       if(file=='pdf'){
        let doc = new PDFDocument({ margin: 30, size:[1000,1000] });

let details=[]
orders.forEach(order => {
   details.push([order._id, order.billingAdress, order.totelAmount,order.paymentOption,order.date.toLocaleDateString(),order.orderStatus,order.paymentStatus]);
  })
  
  const title='sales report'
  const headers = ['Order id', 'billingAdress', 'Total','payment methode','date','order status','payment status'];
  const rows = details

  doc.table({title,headers,rows},{

    columnsSize: [ 200, 200, 100,100,100,100,100 ],

  })


  res.setHeader('Content-disposition', 'attachment; filename=salesReport.pdf');
  res.setHeader('Content-type', 'application/pdf');
  doc.pipe(res);
  doc.end();

       }

        }
        catch(err){
            res.send(err);
        }
    
       
        
    },
    manageOrder:async(req,res)=>{
        try{
        let orderid=req.query.id
        let order=await orderModel.findOne({_id:orderid}).populate('products.product');
        res.render('admin/manageOrder',{order})
        }
        catch(err){
            res.send(err);
        }
    },
    updateOrder:async(req,res)=>{
        try{
        let orderid=req.query.q
        const{orderStatus,paymentStatus}=req.body
        if(orderStatus=='canceld'){
         res.redirect(`/cancelOrder?id=${orderid}`)
        }
        if(orderStatus=='deliverd'){
           let date=Date.now()
            await orderModel.findOneAndUpdate({_id:orderid},{$set:{orderStatus,paymentStatus,deliverdDate:date}})
            res.redirect('/admin/orders')
           }
         else{
        await orderModel.findOneAndUpdate({_id:orderid},{$set:{orderStatus,paymentStatus}})
        res.redirect('/admin/orders')}}
         catch(err){
            res.send(err);
         }
    },
    cancelOrder:async(req,res)=>{
        try{
        let orderid=req.query.id
        //set orderstatus is cancel
      let order= await orderModel.findOneAndUpdate({_id:orderid},{$set:{orderStatus:'canceld'}})
       
        let totelAmount=order.totelAmount
        let userid=order.user

        if(order.paymentStatus=='payed'){
            let user=await userModel.findOneAndUpdate({_id:userid},{ $inc: { wallet: totelAmount } })
            let order= await orderModel.findOneAndUpdate({_id:orderid},{$set:{paymentStatus:'added wallet'}})
      
            
          }
        
        res.redirect('back')}
         catch(err){
            res.send(err);
         }
    
    },
    showBanner:async(req,res)=>{
        try{
   let  banners=await bannerModel.find()
     res.render('admin/allBanners',{banners});}
     catch(err){
        res.send(err);
     }

    },
    addBannerForm:(req,res)=>{
        res.render('admin/addBanner');
    },
    createBanner:async(req,res)=>{
        try{
        const description= req.body.description
        let result=await cloudinary.uploadImage(req.file.path)
        let image=result.secure_url
        let cloudinaryid=result.public_id
         await bannerModel.create({image,description,id:cloudinaryid});
         res.redirect('/admin/banner')}
         catch(err){
            res.send(err)
         }
    },
    updateCoupon:async(req,res)=>{
        try{
        let id=req.query.id
        let{couponId,expiryDate,userAllowed,discount,minimumPurchase,maxAmount}=req.query
        await couponModel.findOneAndUpdate({_id:id},{$set:{couponId,expiryDate,userAllowed,discount,minimumPurchase,maxAmount}})
        res.json({updated:true})}
        catch(err){
            res.json({updated:false})
        }
    },
    unlistbanner:async(req,res)=>{
        try{
        let id =req.params.id
        await bannerModel.findOneAndUpdate({_id:id},{$set:{listed:false}})
        res.redirect('back')}
        catch(err){
            res.send(err)
        }
    },
    listbanner:async(req,res)=>{
        try{
        let id =req.params.id
        await bannerModel.findOneAndUpdate({_id:id},{$set:{listed:true}})
        res.redirect('back')}
        catch(err)
        {
            res.send(err)
        }
    },
    showBannerEdit:async(req,res)=>{
        try{
        let id=req.params.id
       let banner= await bannerModel.findOne({_id:id})
       res.render('admin/editBanner',{banner})}
       catch(err){
        res.send(err);
       }
    },
    updateBanner:async(req,res)=>{
        try{
        let id=req.query.id
        let updated={description}=req.body
        let image=req.file
        let banner=bannerModel.findOne({_id:id})
        if(req.file){
            let path=req.file.path
          let imgid=banner.id
         let data=  await cloudinary.rename(path,imgid)
            updated.image=data.url
        }
       await bannerModel.findByIdAndUpdate({_id:id},{$set:updated})
       res.redirect('/admin/banner')}
       catch(err){
        res.send(err)
       }
    }
    
    
}