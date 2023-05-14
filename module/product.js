const mongoose = require('mongoose')

const Schema = mongoose.Schema

const productSchema = new Schema({
    title:{
        type:String,
        required:true
    },

    price:{
        type:Number,
        required:true
    },

    description:{
        type:String,
        required:true
    },

    imageUrl:{
        type:String,
        required:true
    },
    userId:{
        type:Schema.Types.ObjectId,
        ref:"User",
        required:true,
    }
})

module.exports = mongoose.model('Product', productSchema)


















/*const getDb = require('../utilities/database').getDb
const mongoDb = require('mongodb')

class Product {
    constructor(title, description, imageUrl, price, id, userId){
        this.title = title,
        this.description = description,
        this.price = price,
        this.imageUrl = imageUrl
        this._id = id ? new mongoDb.ObjectId(id) : null,
        this.userId = userId
    }

    save(){
        const db = getDb()
        let dbOp;
        if(this._id){
            dbOp = db.collection('products').updateOne({_id:this._id}, {$set:this})
        }else{
            dbOp = db.collection('products').insertOne(this)
        }
        return dbOp
            .then(result=>{
                // console.log(result)
            })
            .catch(err=>{
                console.log(err)
            })
    }

    static fetchAll(){
        const db = getDb()

        return db.collection('products').find().toArray()
        .then(data=>{
            // console.log(data)
            return data
        })
        .catch(err=>{
            console.log(err)
        })
    }

    static findProductById(productId){
        
        const db = getDb()
        // console.log(productId.toString() == new mongoDb.ObjectId(productId))

        return db.collection('products')
        .findOne({_id: new mongoDb.ObjectId(productId)})
        
        .then(product=>{
            
            return product
        })
        .catch(err=>{
            console.log(err)
        })
    }

    static deleteProductById(productId){
        const db = getDb()
        return db.collection('products').deleteOne({_id: new mongoDb.ObjectId(productId)})
        .then(data=>{
            // console.log(data)
        })
        .catch(err=>{
            console.log(err)
        })
    }
}

module.exports = Product*/