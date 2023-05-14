const sum = function(a, b){
    if(a && b){
        return a + b
    }
    throw new Error('Both should be called')
}

try{
    console.log(sum(2))
}catch(err){
    console.log(err)
}

console.log('good')