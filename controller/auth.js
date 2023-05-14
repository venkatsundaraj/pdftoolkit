const User = require("../module/user")
const bcrypt = require('bcryptjs')
const nodeMailer = require('nodemailer')
const sendGridTransport = require('nodemailer-sendgrid-transport')
const crypto = require('crypto')
const {validationResult} = require('express-validator')


const transporter = nodeMailer.createTransport(sendGridTransport({
    auth:{
        api_key:'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'
    }
}))

const loginHandler = function(req,res,next){
    let message = req.flash('error')
    if(message.length > 0){
        message = message[0]
    }else{
        message=null
    }
    
    res.render('auth/login',{
        title:'Login',
        path:'/login',
        errorMessage:message,
        oldInput:{email:'', password:''},
        validationErros:{}
    })
}

const postLoginHandler = function(req,res,next){
    const email = req.body.email
    const password = req.body.password

    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return res.status(422).render('auth/login',{
            title:'Login',
            path:'login',
            errorMessage:'Email or password are invalid',
            oldInput:{email:email, password:password}   ,
            validationErros:{param:'email',param:'password' }
        })
    }
    
    User.findOne({email:email})
    .then(user=>{
      
        if(!user){
            req.flash('error', 'You entered wrong email')
           return res.status(422).render('auth/login',{
            title:'Login',
            path:'login',
            errorMessage:'You entered wrong email',
            oldInput:{email:email, password:password}  ,
            validationErros:{param:'email'} 
        })
        }
        bcrypt.compare(password, user.password)
        .then(doMatch=>{
          
            if(doMatch){
                req.session.isLoggedIn = true
                req.session.user = user
            return req.session.save((err)=>{
                console.log(err)
                res.redirect('/')
            })
            }
            req.flash('error', 'You entered wrong password or username')
            return res.status(422).render('auth/login',{
            title:'Login',
            path:'login',
            errorMessage:'You entered wrong password or username',
            oldInput:{email:email, password:password}  ,
            validationErros:{param:'password'} 
        })
        })

        
    })
     .catch(err=>{
        // console.log(err)
        const error = new Error(err)
        error.httpStatusCode = 500
        return next(error)
    })
}

const logoutHandler = function(req,res,next){
    req.session.destroy(err=>{
        console.log(err)
        res.redirect('/')
    })
}








const signInHandler = function(req,res,next){
     let message = req.flash('error')
    if(message.length > 0){
        message = message[0]
    }else{
        message=null
    }
    res.render('auth/signup',{
        title:'Signup',
        path:'/signup',
        errorMessage:message,
        oldInput:{email:'',password:'',confirmPassword:''},
        validationErrors:[]
    })
}

const postSignInHandler = function(req,res,next){
    const email = req.body.email
    const password= req.body.password
    const confirmPassword = req.body.confirmpassword
    const errors = validationResult(req)
    // console.log(errors.array())

    if(!errors.isEmpty()){
        // console.log(errors.array())
        return res.status(422)
        .render('auth/signup',{
        title:'Signup',
        path:'/signup',
        errorMessage:errors.array()[0].msg,
        oldInput:{email:email,password:password,confirmPassword:confirmPassword},
        validationErrors:errors.array()
    })
    }

        bcrypt.hash(password, 12)
         .then(encryptPassword=>{
          const newUser = new User({
            email:email,
            password:encryptPassword,
            cart:{items:[]}
        })

        return newUser.save()
    })
    .then(data=>{
        res.redirect('/login')
        return transporter.sendMail({
            to:email,
            from:'venkatesh@firebrandlabs.in',
            subject:'Signup succeed',
            html:'<h1>Your request has been confirmed and you can login</h1>'
        })
    })
       .catch(err=>{
        // console.log(err)
        const error = new Error(err)
        error.httpStatusCode = 500
        return next(error)
    }) 
   
   
    
   
}

const resetPasswordHandler = function(req,res,next){
    let message = req.flash('error')
    if(message.length > 0){
        message = message[0]
    }else{
        message=null
    }
    res.render('auth/reset-password',{
        title:'Reset Password',
        path:'',
        errorMessage:message
    })
}


const postResetHandler = function(req,res,next){
    crypto.randomBytes(32,(err, buffer)=>{
        if(err){
            console.log(err)
            return res.redirect('/reset-password')
        }
        const token = buffer.toString('hex')
        

        User.findOne({email:req.body.email})
        .then(user=>{
            if(!user){
                req.flash('error', 'Cant find the email')
                return res.redirect('/reset-password')
            }

            user.resetToken = token;
            user.resetTokenExpiration = Date.now() + 3600000
            user.save()
        })
        .then(result=>{
            res.redirect('/')
            transporter.sendMail({
                to:req.body.email,
                from:'venkatesh@firebrandlabs.in',
                subject:'Password reset',
                html:`
                <p>You requested the password reset</p>
                <p>Click the <a href="http://localhost:3000/reset-password/${token}">link</a> to reset the password.</p>
                `
            })
        })
         .catch(err=>{
        // console.log(err)
        const error = new Error(err)
        error.httpStatusCode = 500
        return next(error)
    })
    })
}

const getNewPassword = function(req,res,next){
    const token = req.params.token

    User.findOne({resetToken:token, resetTokenExpiration:{$gt:Date.now()}})
    .then(user=>{
        // console.log(user)
     let message = req.flash('error')
    if(message.length > 0){
        message = message[0]
    }else{
        message=null
    }
    res.render('auth/new-password',{
        title:'New Password',
        path:'',
        errorMessage:message,
        userId:user._id.toString(),
        token:token
    })
    })
     .catch(err=>{
        // console.log(err)
        const error = new Error(err)
        error.httpStatusCode = 500
        return next(error)
    })
    
}

const postNewPassword = function(req,res,next){
    const password = req.body.password
    const userId = req.body.userId
    const token = req.body.token
    let resetUser;
    User.findOne({_id:userId,resetTokenExpiration:{$gt:Date.now()} ,resetToken:token})
    .then(user=>{
        resetUser = user
        return bcrypt.hash(password, 12)
    })
    .then(hashPassword=>{
        resetUser.password = hashPassword
        resetUser.resetToken = undefined
        resetUser.resetTokenExpiration = undefined
        return resetUser.save()
    })
    .then(data=>{
        res.redirect('/login')
    })
     .catch(err=>{
        // console.log(err)
        const error = new Error(err)
        error.httpStatusCode = 500
        return next(error)
    })
}

module.exports = {
    loginHandler:loginHandler,
    postLoginHandler:postLoginHandler,
    logoutHandler:logoutHandler,
    signInHandler:signInHandler,
    postSignInHandler:postSignInHandler,
    resetPasswordHandler:resetPasswordHandler,
    postResetHandler:postResetHandler,
    getNewPassword:getNewPassword,
    postNewPassword:postNewPassword
}