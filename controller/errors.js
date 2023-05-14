const express = require('express')
const app = express()

exports.get404 = ((req,res,next)=>{
    res.status(404).render('404',{
        path : '',
        title: '404 Page',
        isAuthenticated:req.session.isLoggedIn
    })
})
exports.get500 = ((req,res,next)=>{
    res.status(500).render('500',{
        path : '',
        title: '500 Page',
        isAuthenticated:req.session.isLoggedIn
    })
})
