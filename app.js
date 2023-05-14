const express = require('express')
const app = express()
const path = require('path')
const rootDir = require('./utilities/path')
const adminRouter = require('./routes/admin')
const bodyParser = require('body-parser')
const ejs = require('ejs')
const User = require('./module/user')
const Product = require('./module/product')
const mongoose = require('mongoose')
const authRouter = require('./routes/auth')
const session = require('express-session')
const MongoDBStore = require('connect-mongodb-session')(session)
const csrf = require('csurf')
const flash = require('connect-flash')
const errorRouter = require('./controller/errors')
const multer = require('multer')

const csrfToken = csrf()
const BASE_URI = 'mongodb+srv://venkatsundaraj:zvLfLwdLBP94k2Ad@cluster0.6rckxqf.mongodb.net/shop?retryWrites=true&w=majority'
// const BASE_URI = 'mongodb+srv://venkateshsundarasan:ijH2WF5wG663KaeR@ecom.dzqup0l.mongodb.net/ecom?retryWrites=true&w=majority'
// const BASE_URI = 'mongodb+srv://venkat:BYGRr4cTzVNyNyu3@cluster-1.3xfgjxl.mongodb.net/e-com?retryWrites=true&w=majority'


const store = new MongoDBStore({
    uri:BASE_URI,
    collection:'sessions'
})

const fileStorage = multer.diskStorage({
  destination: (req, file, cb)=>{
    cb(null,'images')
  },
  filename: (req,file,cb)=>{
    console.log(file)
    cb(null, `${Date.now()}-${file.originalname}`)
  }
})

const fileFilter = (req,file,cb)=>{
    if(file.mimetype==='image/png' ||file.mimetype==='image/jpg' || file.mimetype==='image/jpeg' ){
       
        cb(null, true)
    }else{
        
        cb(null, false)
    }
}


app.set('view engine', 'ejs')
app.set('views', 'views')



// storage:fileStorage,fileFilter:fileFilter


app.use(express.static(path.join(rootDir, 'style')))
app.use("/images",express.static(path.join(rootDir, 'images')))
app.use(bodyParser.urlencoded({extended:false}))
app.use(multer({storage:fileStorage,fileFilter:fileFilter}).single('image'))
app.use(session({resave:false, saveUninitialized:false, secret:'my secret', store:store}))

app.use(csrfToken)
app.use(flash())




app.use((req,res,next)=>{
    res.locals.isAuthendicated = req.session.isLoggedIn
    res.locals.csrfToken = req.csrfToken()
    next()
})



app.use((req,res,next)=>{
    // throw new Error('unidentified user')
    
    if(!req.session.user){
        return next()
    }   
    User.findById(req.session.user._id)
    .then(user=>{
        
        if(!user){
            return next()
        }
        req.user = user
        
        next()
    })
    .catch(err=>{
        //  console.log(err)
        next(new Error())
    })
})



app.use(adminRouter.router)
app.use(authRouter)



 


app.get('/500', errorRouter.get500)
app.use(errorRouter.get404)


app.use((error, req, res, next)=>{
    console.log(error)
    res.status(500).render('500',{
        path : '',
        title: '500 Page',
        isAuthendicated:req.session.isLoggedIn
    })
    console.log('not good')
    // res.redirect('/500')
    // next()
})


mongoose.connect(BASE_URI)
.then(data=>{
        app.listen(3000, ()=>{
            console.log('Server started')
        })
})
.catch(err=>{
    console.log(err)
})