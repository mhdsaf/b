const auth = async (req,res,next)=>{
    console.log("auth middlware")
    next()
}

module.exports = auth