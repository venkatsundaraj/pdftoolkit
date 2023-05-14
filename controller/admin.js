const { default: mongoose } = require('mongoose')
const Product = require('../module/product')
const {validationResult} = require('express-validator')
const fileHelper = require('../utilities/deleteFile')

const getForm = (req,res,next)=>{
    res.render('admin/edit-product', {
        path:'admin/add-product',
        title:'add-product',
        editing:false,
        hasError:false,
        errorMessage:null,
        isAuthendicated:req.session.isLoggedIn,
        validationErrors:[]
    })
}


const redirectHome = (req,res,next)=>{
    console.log('good')
    const title = req.body.name;
    const description = req.body.description
    const image = req.file
    const price = req.body.amount

    const errors = validationResult(req)

    

    if(!image){
         return res.status(422).render('admin/edit-product', {
        path:'admin/add-product',
        title:'add-product',
        editing:false,
        hasError:true,
        product:{
            title:title,
            description:description,
            price:price
        },
        errorMessage:'Cannot identify the image',
        validationErrors:[]
    })
    }
    
    const imageUrl = image.path
    
    
    if(!errors.isEmpty()){
        return res.status(422).render('admin/edit-product', {
        path:'admin/add-product',
        title:'add-product',
        editing:false,
        hasError:true,
        product:{
            title:title,
            description:description,
            imageUrl:imageUrl,
            price:price
        },
        errorMessage:errors.errors[0].msg,
        validationErrors:errors.array()
    })
    }
    
    const product = new Product({
        title:title,
        description:description,
        price:price,
        imageUrl:imageUrl,
        userId: req.user
    })
    product.save()
    .then(data=>{
        console.log('Product created')
        // console.log(data)
        res.redirect('/')
    })
    
    .catch(err=>{
        
        const error = new Error(err)
        error.httpStatusCode = 500
        return next(error)
    })
  
    
}


const getAllProducts = function(req, res, next){
    
    Product.find({userId:req.user._id})
         .then(products=>{
        res.render('admin/all-product',{
        products:products,
        path : 'admin/all-products',
        isAuthendicated:req.session.isLoggedIn,
        title:'all-product'
    })
     })
      .catch(err=>{
        // console.log(err)
        const error = new Error(err)
        error.httpStatusCode = 500
        return next(error)
    })

     
}


const getEditProductPage = function(req,res,next){
    const editMode = req.query.edit
    
    if(editMode==='false'){
       return res.redirect('/')
    }

    const productId = req.params.productId
    
    Product.findById(productId)
    .then(product=>{
        
        
        if(!product){
            return
        }


        res.render('admin/edit-product',{
        title:'edit-product',
        isAuthendicated:req.session.isLoggedIn,
        path:'admin/edit-product',
        editing:editMode,
        hasError:false,
        errorMessage:null,
        product:product,
        validationErrors:[]
    })
    }) 
    .catch(err=>{
        // console.log(err)
        const error = new Error(err)
        error.httpStatusCode = 500
        return next(error)
    })

    
}



const editProductItem = function(req,res,next){
    const title = req.body.name
    const image = req.file
    const price = req.body.amount
    const description = req.body.description
    const id = req.body.productId
    
    const errors = validationResult(req)

    if(!image){
        return res.status(422).render('admin/edit-product', {
        path:'admin/edit-product',
        title:'Edit Product',
        editing:true,
        hasError:true,
        product:{
            title:title,
            description:description,
            price:price
        },
        errorMessage:errors.errors[0].msg,
        validationErrors:errors.array()
    })
    }

    const imageUrl = image.path

    if(!errors.isEmpty()){
        return res.status(422).render('admin/edit-product', {
        path:'admin/edit-product',
        title:'Edit Product',
        editing:true,
        hasError:true,
        product:{
            title:title,
            description:description,
            imageUrl:imageUrl,
            price:price
        },
        errorMessage:errors.errors[0].msg,
        validationErrors:errors.array()
    })
    }
    

    Product.findById(id)
    .then(product=>{
        
        if(product.userId.toString() !== req.user._id.toString()){
            
            return res.redirect('/')
        }
        product.title = title
        product.description = description
       if(image) {
        fileHelper.deleteFile(product.imageUrl)
        product.imageUrl = imageUrl
        }
        product.price = price

        return product.save()
        .then(product=>{
        console.log('product updated')
        
        res.redirect('/')
    })
    })
    
     .catch(err=>{
        // console.log(err)
        const error = new Error(err)
        error.httpStatusCode = 500
        return next(error)
    })
   
}

const getDeleteProduct = function(req, res, next){
    const deleteId = req.body.productId
    
    Product.findById(deleteId)
    .then(data=>{
        fileHelper.deleteFile(data.imageUrl)
        return Product.deleteOne({_id:deleteId, userId:req.user._id})
    })
    .then(result=>{
        console.log('Product deleted')
        res.redirect('/')
    }) 
    .catch(err=>{
        // console.log(err)
        const error = new Error(err)
        error.httpStatusCode = 500
        return next(error)
    })
    
    
    
}


module.exports = {
    redirectHome:redirectHome,
    getForm:getForm,
    getAllProducts:getAllProducts,
    getEditProductPage:getEditProductPage,
    editProductItem:editProductItem,
    getDeleteProduct:getDeleteProduct
}

/*const Product = require('../module/product')





const getForm = (req,res,next)=>{
    res.render('admin/edit-product', {
        path:'admin/add-product',
        title:'add-product',
        editing:false
    })
}

const redirectHome = (req,res,next)=>{
    // console.log(req.body.product)
    // const products = new Products(null, req.body.name, req.body.description, req.body.imageUrl, req.body.amount)
    const title = req.body.name;
    const description = req.body.description
    const imageUrl = req.body.imageUrl
    const price = req.body.amount
    
    
    const product = new Product(title, description,imageUrl, price, null, req.user._id)
    product.save()
    .then(data=>{
        // console.log(data)
    })
    .then(data=>{
        res.redirect('/')
    })
    .catch(err=>{
        console.log(err)
    })
  
    
}

const getAllProducts = function(req, res, next){
    Product.fetchAll()
         .then(products=>{
        res.render('admin/all-product',{
        products:products,
        path : 'admin/all-products',
        title:'all-product'
    })
     }).catch(err=>console.log(err))

     
}


const getEditProductPage = function(req,res,next){
    const editMode = req.query.edit

    if(editMode==='false'){
       return res.redirect('/')
    }

    const productId = req.params.productId
    
    Product.findProductById(productId)
    .then(product=>{
        
        
        if(!product){
            return
        }


        res.render('admin/edit-product',{
        title:'edit-product',
        path:'admin/edit-product',
        editing:editMode,
        product:product
    })
    }).catch(err=>console.log(err))

    

    
}


const editProductItem = function(req,res,next){
    const title = req.body.name
    const imageUrl = req.body.imageUrl
    const price = req.body.amount
    const description = req.body.description
    const id = req.body.productId

    

    const product = new Product(title, description, imageUrl, price, id)
    product.save()
    .then(product=>{
        console.log('product updated')
        // console.log(product)
        res.redirect('/')
    }).catch(err=>console.log(err))

    
    
}


const getDeleteProduct = function(req, res, next){
    const deleteId = req.body.productId
    Product.deleteProductById(deleteId)
    .then(result=>{
        console.log('Product deleted')
        res.redirect('/')
    }).catch(err=>console.log(err))
    
}

module.exports = {
    getForm:getForm,
    redirectHome:redirectHome,
    getAllProducts:getAllProducts,
    getEditProductPage:getEditProductPage,
    editProductItem:editProductItem,
    getDeleteProduct:getDeleteProduct
}

*/