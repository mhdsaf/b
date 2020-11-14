const express = require('express');
const Student = require('../models/student/studentCollection')
const studentAuth =  require('../middleware/studentAuth');
const scrape = require('../generalPurposeFunctions/scrape/scrape')
const router = new express.Router();

router.post('/students/signup', async (req,res)=>{
    
    try{
        const newStudent = await new Student({
            fname: req.body.fname,
            lname: req.body.lname,
            email: req.body.email,
            interests: req.body.interests,
            country: req.body.country,
            password: req.body.password
        })
        await newStudent.save()
        res.status(201).send({message: "succesfully signed in!"})
    }catch(e){
        res.status(400).send({error: e})
    }
})
router.post('/students/login',async(req,res)=>{
    try{
        const student = await Student.findByCredentials(req.body.email,req.body.password)
        const token = await student.generateAuthToken()
        res.status(200).send({token: token})
    }catch(e){
        res.status(400).send({error: e.message})
    }
})
router.post('/students/add-advisor',studentAuth,async(req,res)=>{
    console.log(req.studentemail);
     try{
        const student = await Student.findOne({email:req.studentemail})
        const addAdvisor = await student.addAdvisor(req.body.email)
        res.status(200).send("advisor added")
        }
        catch(e){
            res.status(400).send({error: e.message})
        }
})
router.get('/mostdemandedjobs', async (req,res)=>{
    try {
        const data = await scrape('https://www.indeed.com/career-advice/finding-a-job/in-demand-careers')
        res.status(200).send(data)
    } catch (error) {
        console.log(error)
    }
})
module.exports = router 