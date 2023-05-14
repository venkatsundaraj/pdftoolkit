const fs = require('fs')

const deleteFile = function(file){
    fs.unlink(file, (err)=>{
        if(err){
            throw(err)
        }
    })
}

module.exports = {
    deleteFile : deleteFile
}