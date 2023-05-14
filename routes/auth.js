const express = require('express')
const router = express.Router()
const authController = require('../controller/auth')
const {check, body}= require('express-validator')
const User = require('../module/user')

// console.log(body())

router.get('/login',
[
check('email')
.isEmail()
.withMessage('Email is not valid')
.normalizeEmail(),


body('password', 'please enter the valid password which is more than 5 characters long')
.isLength({min:6})
.isAlphanumeric()
.trim()
],authController.loginHandler)


router.post('/login-user', authController.postLoginHandler)


router.post('/logout', authController.logoutHandler)

router.get('/signup', authController.signInHandler)
router.post('/signup',
[
check('email')
.isEmail()
.withMessage('Email is not valid')
.custom((value,{req})=>{
    // if(value==='test@gmail.com'){
    //     throw new Error('Email is not verified')
    // }
    // return true

    //Asynchronous code

    return User.findOne({email:value})
    .then((user)=>{
        if(user){
            return Promise.reject('Email already exist please choose different one')
        }
})

})
.normalizeEmail(),

body('password', 'please enter the valid password which is more than 5 characters long')
.isLength({min:6})
.trim()
.isAlphanumeric()
.trim(),

body('confirmpassword')
.trim()
.custom((value,{req})=>{
    if(value !== req.body.password){
        throw new Error ('Password should match')
    }
    return true
})

]
, authController.postSignInHandler)

router.get('/reset-password', authController.resetPasswordHandler)
router.post('/reset-password', authController.postResetHandler)
router.get('/reset-password/:token', authController.getNewPassword)
router.post('/new-password',authController.postNewPassword)


module.exports = router