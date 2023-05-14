const mongoose = require('mongoose')
const Schema = mongoose.Schema


const userSchema = new Schema({
    
    email :{
        type:String,
        required:true
    },
    password :{
        type:String,
        required:true
    },
    resetToken:String,
    resetTokenExpiration:Date,
    cart:{items:[{productId:{
        type:Schema.Types.ObjectId,
        ref:"Product",
        required:true,
    }, quantity:{
        type:Number,
        required:true
    }}]}
})

userSchema.methods.addToCart = function(product){
    const cartItemIndex = this.cart.items.findIndex(cartProduct=>cartProduct.productId.toString()===product.id.toString())
    
    const updatedCarts = [...this.cart.items]
    let newQuantity = 1

    if(cartItemIndex>=0){
        const oldQuantity = this.cart.items[cartItemIndex].quantity
        updatedCarts[cartItemIndex].quantity = oldQuantity + newQuantity
    }else{
        updatedCarts.push({
            productId:product._id,
            quantity:newQuantity
        })
    }

    const updatedCartItems = {
        items:updatedCarts
    }

    this.cart = updatedCartItems
    return this.save()

}


userSchema.methods.removeProductFromCart = function(productId){
    const updatedCarts = this.cart.items.filter(item=>{
        return item.productId.toString() !== productId.toString()
    })

    this.cart.items = updatedCarts
    return this.save()
}

userSchema.methods.clearCart = function(){
    this.cart = {items:[]}
    return this.save()  
}

module.exports = mongoose.model('User', userSchema)


/*const mongoDb = require('mongodb')

const getDb = require('../utilities/database').getDb

class User {
    constructor(email, password, cart, id){
        this.email = email,
        this.password = password,
        this.cart = cart
        this._id = id
    }

    save(){
        const db = getDb()
        return db.collection('users').insertOne(this)
        .then(data=>{
            // console.log(data)
        })
        .catch(err=>{
            console.log(err)
        })
    }

    static findUserById(userId){
        const db = getDb()
        return db.collection('users').find({_id:new mongoDb.ObjectId(userId)})
        .next()
        .then(data=>{
            // console.log(data)
            return data
        })
        .catch(err=>{
            console.log(err)
        })
    }

    addCartItem(product){
        const db = getDb()
        let newQuantity = 1

                
            const cartItemIndex = this.cart.items.findIndex(item=>{
           return item.productId.toString() === product._id.toString()
        })
        
        

        const updatedItems =this.cart.items ? [...this.cart.items] : [] //[{},{}]
        

        if(cartItemIndex >= 0){
            newQuantity = updatedItems[cartItemIndex].quantity + 1
            updatedItems[cartItemIndex].quantity = newQuantity
        }else{
            updatedItems.push({productId:new mongoDb.ObjectId(product._id), quantity:newQuantity})
        }


        const updatedCart = {items:updatedItems} 


        return db.collection('users').updateOne({_id: new mongoDb.ObjectId(this._id)},{$set:{cart:updatedCart}}) 
            .then(data=>{
                console.log(data)
            })
            .catch(err=>{
                console.log(err)
            })
    }

    getCarts(){
        const db = getDb()
        const allCartIds = this.cart.items.map(product=>product.productId)
        
        return db.collection('products')
        .find({_id :{$in: allCartIds}})
        .toArray()
        .then(products=>{
            
            return products.map(product=>{
                
                return {...product,
                    quantity: this.cart.items.find(cartQuantity=>{
                    
                    return cartQuantity.productId.toString() === product._id.toString()

                }).quantity
            }
            })
        })
        .catch(err=>{
            console.log(err)
        })
    }



    deleteCartById(productId){
        const db = getDb()
        console.log(new mongoDb.ObjectId(productId))
        
       const updatedCart = this.cart.items.filter(carts=>carts.productId.toString() !== productId.toString())
       console.log(updatedCart)
       
        return db.collection('users').updateOne({_id: new mongoDb.ObjectId(this._id)},{$set:{cart:{items:updatedCart}}})
        .then(data=>{
            console.log(data)
        })
        .catch(err=>{
            console.log(err)
        })
    }



    addOrderItem(){
        const db = getDb()
       return this.getCarts().then(products=>{
            const cart = {
                products:products,
                user : {
                    _id : new mongoDb.ObjectId(this._id),
                    email:this.email
                }
            }
            return db.collection('orders').insertOne(cart)
        })
        .then(result=>{
            this.cart = {items:[]}
            return db.collection('users').updateOne({_id:new mongoDb.ObjectId(this._id)},{$set:{cart:{items:[]}}})
        })
        .then(data=>{
            console.log(data)
        })
        .catch(err=>{
            console.log(err)
        })

    }

    getAllOrders(){
        const db = getDb()

        return db.collection('orders')
        .find({'user._id' : new mongoDb.ObjectId(this._id)})
        .toArray()
        .then(data=>{
            // console.log(data)
            return data
        })
        .catch(err=>{
            console.log(err)
        })
    }
}

module.exports = User*/