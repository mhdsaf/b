const express = require('express');
// require advisor database to use it
const Advisor = require('../models/advisor/advisorCollection')
const SecretCode = require('../models/SecretCode/SecretCode')
const advisorAuth =  require('../middleware/advisorAuth')
const randomstring = require('randomstring')
const welcomeEmail = require('.././generalPurposeFunctions/sendEmail')
const Note = require('../models/notes/noteCollection')
const router = new express.Router();

router.post('/advisors/signup', async(req, res)=>{
    try {
        let advisor = await new Advisor({
            fname: req.body.fname,
            lname: req.body.lname,
            email: req.body.email,
            password: req.body.password
        });
        const returnedAdvisor = await advisor.save();
        const secretCode = new SecretCode({
            email: req.body.email,
            code: randomstring.generate(32)
        })
        await secretCode.save()
        await welcomeEmail(req.body.email,req.body.fname+' '+req.body.lname,`http://localhost:3000/validate-account/${returnedAdvisor._id}/${secretCode._id}`)
        res.status(200).send({message:"recieved"})
    } catch (error) {
        console.log(error)
        res.status(400).send({message: 'Missing field(s)'})
    }
})

router.post('/validate-account',async(req,res)=>{
    try{
        const advisor = await Advisor.findById(req.body.advisor_id)
        const secretCode = await SecretCode.findById(req.body.secret_code)
        if(!secretCode){
            throw new Error()
        }
        if(advisor.email===secretCode.email){
            advisor.status = "active"
            await advisor.save()
            res.status(200).send({message:"recieved"})
        }
    }catch(e){
        res.status(400).send({erro:"error"})
    }
})

router.post('/advisors/login',async(req,res)=>{
    try{
        const advisor = await Advisor.findByCredentials(req.body.email,req.body.password)
        if(!advisor.status==="active"){
            throw new Error("please verify your account")
        }
        const token = await advisor.generateAuthToken()
        res.status(200).send({token: token})
    }catch(e){
        if(e.message==="please verify your account"){
            res.status(400).send({error:e.message})
        }
        res.status(400).send({error: "unexpected error"})
    }
})
router.post('/advisors/add-student',advisorAuth,async(req,res)=>{
    try{
        //keep tracking advisor
        console.log(req.advisorId)
        const advisor = await Advisor.findById(req.advisorId)
        res.status(200).send({advisor_name:advisor.fname+' '+advisor.lname})
    }catch(e){
        res.status(400).send({error: "unexpected error"})
    }
    
})

//getNotes
router.get('/advisors/notes',advisorAuth,async(req,res)=>
{
    try{
        const notes =await Note.find({advisors: req.advisorId}).populate('advisors','email').populate('students','email')
        res.send({notes})
    }catch(e)
    {
        res.status(400).send({error:e})
    }
})
//addNotes
router.post('/advisors/notes',advisorAuth,async(req,res)=>
{
    try{
        const student = await Student.findById(req.body.student)
        if(!student)
        {
            res.status(401).send({error: "Incorrect inputs"}) 
        }
        else{
        console.log(req.advisorId)
        const newNote = await new Note({
            advisors: req.advisorId,
            students: req.body.student,
            title: req.body.title,
            body: req.body.body,
            type: 'advice'    
        })
         }   
        console.log(req.body.student)
        await newNote.save()
        res.status(201).send({message: "Note saved!"})
    }catch(e)
    {
        res.status(400).send({error: e})
    }
})

module.exports = router