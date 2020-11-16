const express = require('express');
const Student = require('../models/student/studentCollection')
const studentAuth =  require('../middleware/studentAuth');
const scrape = require('../generalPurposeFunctions/scrape/scrape')
const router = new express.Router();
const Note = require('../models/notes/noteCollection')
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

//getNotes
router.get('/students/notes',studentAuth,async(req,res)=>
{
    try{
        const notes =await Note.find({students: req.studentid}).populate('students')
        res.send({notes})
    }catch(e)
    {
        res.status(400).send({error:e})
    }
})

//createNote
router.post('/students/notes',studentAuth,async(req,res)=>
{
    try{
        const newNote = await new Note({
            title: req.body.title,
            body: req.body.body,
            type: 'toSelf',
            students: req.studentid,
            advisors: null
        })
        await newNote.save()
        res.status(201).send({message: "Note saved!"})
    }catch(e)
    {
        res.status(400).send({error: e})
    }
})

//editNote
router.patch('/students/notes/:id',studentAuth,async(req,res)=>
{
    try{
        const note = await Note.findById({_id:req.params.id})
        if(!note.students.equals(req.studentid))
        {
            res.status(401).send({error: "Input a correct ID"}) 
        }
        else
        {
            
            let titleNew = req.body.title
            note.title = titleNew
            let bodyNew = req.body.body
            note.body = bodyNew
          
            await note.save()
            res.status(201).send({message: "Note title changed!"})
        }
    }catch(e)
    {
        res.status(400).send({error:e})
    }
})
//deleteNote
router.delete('/students/notes/:id',studentAuth,async(req,res)=>
{
    try{
        const note = await Note.findById({_id:req.params.id})
        if(!note)
        {
            res.status(401).send({error:"Input a correct ID"})
        }
        if(!note.students.equals(req.studentid))
        {
            res.status(401).send({error: "Input a correct ID"}) 
        }
        else
        {          
            await note.deleteOne()
            res.status(201).send({message: "Note Deleted!"})
        }
    }catch(e)
    {
        res.status(400).send({error:e})
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