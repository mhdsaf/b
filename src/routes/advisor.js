const express = require('express');
// require advisor database to use it
const Advisor = require('../models/advisor/advisorCollection')
const SecretCode = require('../models/SecretCode/SecretCode')
const advisorAuth =  require('../middleware/advisorAuth')
const randomstring = require('randomstring')
const nodemailer = require('.././generalPurposeFunctions/sendEmail')

const router = new express.Router();

router.post('/advisors/signup', async(req, res)=>{
    try {
        let advisor = await new Advisor({
            fname: req.body.fname,
            lname: req.body.lname,
            email: req.body.email,
            password: req.body.password
        });
        await advisor.save();
        const secretCode = new SecretCode({
            email: req.body.email,
            code: randomstring.generate(32)
        })
        
        res.status(200).send({message: "sign up completed"})
    } catch (error) {
        res.status(400).send({message: 'Missing field(s)'})
    }
})
router.post('/validate-account/:advisor_id/:secretcode',async(req,res)=>{

})
router.post('/advisors/login',async(req,res)=>{
    try{
        const advisor = await Advisor.findByCredentials(req.body.email,req.body.password)
        const token = await advisor.generateAuthToken()
        res.status(200).send({token: token})
    }catch(e){
        res.status(400).send({error: "unexpected error"})
    }
})
router.post('/advisors/add-student',advisorAuth,async(req,res)=>{
    try{
        //keep tracking advisor
        const advisor = await Advisor.findById(req.advisorId)
        res.status(200).send({advisor})
    }catch(e){
        res.status(400).send({error: "unexpected error"})
    }
    
})

module.exports = router