const path = require('path')
const fs = require('fs')
const PDFDocument = require('pdfkit')
const Product = require('../module/product')
const Order = require('../module/order')
const product = require('../module/product')


const getIndex = (req,res,next)=>{
    
     Product.find().then(result=>{
       
       res.render('shop/index',{
        products:result,
        path : '/',
        title:'home',
        
        csrfToken:req.csrfToken()
    })
    })
     .catch(err=>{
        // console.log(err)
        const error = new Error(err)
        error.httpStatusCode = 500
        return next(error)
    })   
       
}


const getProducts = (req,res,next)=>{
    

    Product.find().then(result=>{
       res.render('shop/productList',{
        products:result,
        
        path : 'shop/productList',
        title:'product-list'
    })
    })
     .catch(err=>{
        // console.log(err)
        const error = new Error(err)
        error.httpStatusCode = 500
        return next(error)
    })  
    
}


const getProductDetails = function(req,res,next){
    const productId = req.params.productId
    
    Product.findById(productId)
    .then(product=>{
        // console.log(product)
        res.render('shop/productDetail',{
            path:'shop/productDetail',
            title:product.title,
            
            product:product
        })
    })
     .catch(err=>{
        // console.log(err)
        const error = new Error(err)
        error.httpStatusCode = 500
        return next(error)
    })
    
}

const getPostCartItems = function(req,res,next){
    const productId = req.body.productId
    // console.log(productId)
    Product.findById(productId)
    .then(data=>{
        return req.user.addToCart(data)
    })
    .then(data=>{

        res.redirect('/')
    })
     .catch(err=>{
        // console.log(err)
        const error = new Error(err)
        error.httpStatusCode = 500
        return next(error)
    })
}

const getAllCartItems = (req,res,next)=>{
    req.user
    .populate('cart.items.productId')
    .then(carts=>{
        const cartItems = carts.cart.items
       res.render('shop/cart',{
            title:'Cart',
            path: 'shop/cart',
            
            cartProducts:cartItems
        })
    })
     .catch(err=>{
        // console.log(err)
        const error = new Error(err)
        error.httpStatusCode = 500
        return next(error)
    })     
    
}

const removeCartProducts = function(req,res,next){
    const productId = req.body.productId
    req.user.removeProductFromCart(productId)
    .then(data=>{

        res.redirect('/cart')
    })
     .catch(err=>{
        // console.log(err)
        const error = new Error(err)
        error.httpStatusCode = 500
        return next(error)
    })
}



const addOrderItems = function(req,res,next){

    req.user
    .populate('cart.items.productId')
    .then(data=>{
        // console.log(data)
        const productsAll = data.cart.items.map(productItem=>{
            
            return {quantity:productItem.quantity, product:{...productItem.productId._doc}}
        })
        // console.log(productsAll)
        
        const order = new Order({
            products:productsAll,
            user:{
                email:req.user.email,
                userId:req.user,
            },
            
        })

        return order.save()
    })
    .then(data=>{
        return req.user.clearCart()
    })
    .then(data=>{
        res.redirect('/orders')
    })
    .catch(err=>{
        const error = new Error(err)
        error.httpStatusCode = 500
        return next(error)
    })
    
}

const getOrders= function(req,res,next){
    Order.find({'user.userId': req.user._id})
    .then((order)=>{
        
        res.render('shop/orders',{
        title:'Orders',
        path: 'shop/orders',
        
        orders:order
    })
    })
    .catch(err=>{
        console.log(err)
    })
}


const getInvoice = function(req,res,next){
    const {orderId} = req.params
    const invoiceName = `invoice-${orderId}.pdf`
    const invoiceLoc = path.join('datastore','invoice',invoiceName)

    Order.findById(orderId)
    .then(order=>{
        
        if(!order){
            return next(new Error('Invalid order'))
        }
        if(order.user.userId.toString()!==req.user._id.toString()){
             return next(new Error('Unauthorised user'))
        }

        const pdfDoc = new PDFDocument()
        res.setHeader('Content-Type','application/pdf')
        res.setHeader('Content-Disposition','inline; filename="' + invoiceName + '"')

        pdfDoc.pipe(fs.createWriteStream(invoiceLoc))
        pdfDoc.pipe(res)

        pdfDoc.fontSize(26).text('Invoice',{
            underline:true,
        })
        pdfDoc.text('--------------------------------')

        let totalPrice;
        order.products.forEach(product=>{
            totalPrice = product.product.price
            pdfDoc.text(`You ordered ${product.product.title} for ${product.product.price}Rs of the quantity of ${product.quantity}`)

            pdfDoc.text(`Total price:${totalPrice}`)
        })
        pdfDoc.end()



        // fs.readFile(invoiceLoc,(err, data)=>{
        // if(err){
        //    return next(err)
        // }

        // res.setHeader('Content-Type', 'application/pdf')
        // res.setHeader('Content-Disposition','inline; filename="' + invoiceName + '"')
        // res.send(data)
    // })

    // const file = fs.createReadStream(invoiceLoc)

    // res.setHeader('Content-Type','application/pdf')
    // res.setHeader('Content-Disposition','inline; filename="' + invoiceName + '"')
    // file.pipe(res)
    })
    .catch(err=>{
        next(err)
    })

   
}

module.exports = {
    getIndex : getIndex,
    getProducts : getProducts,
    getProductDetails:getProductDetails,
    getPostCartItems:getPostCartItems,
    getAllCartItems:getAllCartItems,
    removeCartProducts:removeCartProducts,
    addOrderItems:addOrderItems,
    getOrders:getOrders,
    getInvoice:getInvoice
}

