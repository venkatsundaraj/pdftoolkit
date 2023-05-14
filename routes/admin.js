const express = require('express')
const router = express.Router()
const path = require('path')
const adminPath = require('../utilities/path')
const shopController = require('../controller/shop')
const adminController = require('../controller/admin')
const isAuth  = require('../middleware/is-auth')
const {body} = require('express-validator')



router.get('/', shopController.getIndex)

router.get('/cart', isAuth, shopController.getAllCartItems)

router.post('/cart', isAuth, shopController.getPostCartItems)

router.get('/product-list', isAuth, shopController.getProducts)

// router.get('/checkout', shopController.getCheckout)

router.get('/orders', isAuth, shopController.getOrders)

router.get('/product/:productId', shopController.getProductDetails)

router.post('/remove-cart-product', isAuth, shopController.removeCartProducts)

router.post('/add-to-bag', isAuth, shopController.addOrderItems)

router.get('/orders/:orderId', isAuth, shopController.getInvoice)






router.get('/admin/add-product', isAuth, adminController.getForm)

router.post('/product',[
    body('name')
    .isString()
    .isLength({min:3})
    .trim()
    .withMessage('Title is a mantatory field'),
    // body('imageUrl')
    // .isURL(),
    body('amount').isFloat(),
    body('description').isLength({min:4, max:400}).trim()
],isAuth, adminController.redirectHome)

router.get('/admin/all-products', isAuth, adminController.getAllProducts)

router.get('/admin/edit-product/:productId', isAuth, adminController.getEditProductPage)

router.post('/edit-product',[
    body('name')
    .isString()
    .isLength({min:3})
    .trim(),
    // body('imageUrl')
    // .isURL(),
    body('amount').isFloat(),
    body('description').isLength({min:4, max:400}).trim()
], isAuth, adminController.editProductItem)

router.post('/admin/delete-product/', isAuth, adminController.getDeleteProduct)


module.exports={
    router
}