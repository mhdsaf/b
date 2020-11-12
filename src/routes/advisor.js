const express = require('express');
// require advisor database to use it
const Advisor = require('../models/advisor/advisorCollection')
const advisorAuth =  require('../middleware/advisorAuth');

const router = new express.Router();

router.get('/advisors', (req,res)=>{
    res.send({
        students: 'Malka'
    })
})

router.post('/advisors/signup', async(req, res)=>{
    try {
        let advisor = await new Advisor({
            fname: req.body.fname,
            lname: req.body.lname,
            email: req.body.email,
            password: req.body.password
        });
        await advisor.save();
        res.status(201).send({message: "Successfully signed up"})
    } catch (error) {
        res.status(400).send({message: 'Missing field(s)'})
    }
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