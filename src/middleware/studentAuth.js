const jwt = require('jsonwebtoken')
const Student =  require('../models/student/studentCollection')
const studentAuth = async (req,res,next)=>{
    try{
        const token = req.header('Authorization').replace('Bearer ','')
        const decoded = jwt.verify(token,'fypfridaystudent')
        const student = await Student.findOne({email: decoded.email, 'tokens.token': token})
        if(!student){
            throw new Error(e)
        }
        req.studentId = student._id
        next()
    }catch(e){
        res.status(401).send({error: "unauthorized"}) 
    }
}

module.exports = studentAuth