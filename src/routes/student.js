const express = require('express');
const Student = require('../models/student/studentCollection')
const studentAuth =  require('../middleware/studentAuth');
const scrapeMostDemandedJobs = require('../generalPurposeFunctions/scrape/scrapeMostDemanded')
const jwt = require('jsonwebtoken')
const scrapeAllRoles = require('../generalPurposeFunctions/scrape/scrapeAllRoles')
const router = new express.Router();
const Note = require('../models/notes/noteCollection')
const Scraping = require('../models/scraping/scrapingCollection')
const welcomeEmail = require('../generalPurposeFunctions/Emails/welcomeEmail')
const zeus = require('../generalPurposeFunctions/scrape/scrapeRolesDetails/try')
const bcrypt = require('bcrypt')
const resetPasswordEmail = require('../generalPurposeFunctions/Emails/resetPasswordEmail')
const writeCsv = require('../generalPurposeFunctions/scrape/csvWriteTemplate')
router.post('/students/signup', async (req,res)=>{    
    try{
        let oldStudent = await Student.findOne({email: req.body.email})
        if(oldStudent!=undefined){
            throw new Error('Email already taken')
        }
        const hashedPass = await bcrypt.hash(req.body.password, 8)
        const newStudent = await new Student({
            fname: req.body.fname,
            lname: req.body.lname,
            email: req.body.email,
            interests: req.body.interests,
            country: req.body.country,
            password: hashedPass
        })
        await newStudent.save()
        const token = await jwt.sign({email: req.body.email},'fypfridaystudent', {expiresIn: '3600000000'})
        await welcomeEmail(req.body.email, req.body.fname, req.body.lname, token)
        res.status(201).send({message: "succesfully signed in!"})
    }catch(e){
        res.status(400).send({error: e.message})
    }
})

router.post('/students/verify', async (req,res)=>{
    try {
        const token = req.body.token
        const decodedToken = jwt.verify(token, 'fypfridaystudent')
        console.log(decodedToken.email)
        const student = await Student.findOne({email: decodedToken.email})
        student.status = 'active'
        const newToken = await jwt.sign({email: student.email},'fypfridaystudent', {expiresIn: '3600000'})
        await student.save()
        res.status(200).send({token: newToken})
    } catch (error) {
        res.send(error)
    }
})

router.post('/students/login',async(req,res)=>{
    try{
        const student = await Student.findOne({email:req.body.email})
        if(student){
            if(student.status=='active'){
                const password = await student.password.trim()
                console.log(password)
                console.log(req.body.password)
                const isMatch = await bcrypt.compare(req.body.password, password)
                if(isMatch){
                    const newToken = await jwt.sign({email: student.email},'fypfridaystudent', {expiresIn: '3600000'})
                    res.status(200).send({token: newToken})
                }else{
                    throw new Error('invalid credentials')
                }
            }else{
                throw new Error('unverified account')
            }
        }else{
            throw new Error('invalid credentials')
        }
        
    }catch(e){
        res.status(400).send({error: e.message})
    }
})

router.post('/students/resetpass', async (req, res)=>{
    try {
        const token = await jwt.sign({email: req.body.email},'fypfridaystudent', {expiresIn: '3600000'})
        await resetPasswordEmail(req.body.email, token)
        res.status(200).send('Email sent')
    } catch (e) {
        console.log(e)
        res.status(400).send({error: e.message})
    }
})

router.patch('/students/resetpass', async (req, res)=>{
    try {
        const student = await Student.findOne({email: req.body.email})
        const hashedPass = await bcrypt.hash(req.body.password, 8)
        student.password = hashedPass
        await student.save()
        res.status(200).send('Password changed successfully')
    } catch (e) {
        console.log(e)
        res.status(400).send({error: e.message})
    }
})

router.get('/students/info', studentAuth, async (req, res)=>{
    try {
        let student = await Student.findOne({email: req.studentemail})
        res.send({
            fname: student.fname,
            lname: student.lname,
            didTakeTest: student.didTakeTest
        })
    } catch (error) {
        console.log(error)
        res.send(error)
    }
})

router.get('/token-validity', studentAuth, async (req,res)=>{
    try {
        res.status(200).send({email: req.studentemail})
    } catch (e) {
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

///// SCRAPING ONLY:
router.get('/mostdemandedjobs', async (req,res)=>{
    try {
        const data = await scrapeMostDemandedJobs('https://www.indeed.com/career-advice/finding-a-job/in-demand-careers')
        res.status(200).send(data)
    } catch (error) {
        console.log(error)
    }
})

router.get('/career-roles', async (req, res)=>{
    try {
        scrapedData = await scrapeAllRoles('https://www.indeed.com/career-advice/careers')
        // const Prom1 = await new Scraping({
        //     description: 'Roles',
        //     data : scrapedData
        // })
        // await Prom1.save()
        const Prom1 = await Scraping.findOne({description: 'Roles'})
        arr = [...Prom1.data]
        await scrapedData.forEach(element => {
            arr.push(element)
        });
        Prom1.data = arr
        await Prom1.save()
        res.send('success')
    } catch (error) {
        console.log(error)
    }
})
router.get('/excel', async (req,res)=>{
    const fs = require('fs')
    const parse = require('csv-parser')
    // const Prom1 = await Scraping.findOne({description: 'Roles'})
    // console.log(Prom1)
    let csvData = []
    let parsedRoles = []
    // roles
    const roles = await fs.createReadStream('roles.csv')
    roles.pipe(parse({
        delimiter: ','
    })
    )
    .on('data', function (row) {
        csvData.push(row)
    })
    .on('end', async() => {
        //parsedRoles.push('wedding-planner')
        await csvData.forEach(async element => {
            await parsedRoles.push(Object.values(element)[0])
        });
        //console.log(parsedRoles[0])
    })

    let csvData1 = []
    let parsedJobs = []
    const jobs = await fs.createReadStream('jobs.csv')
    jobs.pipe(parse({
        delimiter: ','
    })
    )
    .on('data', function (row) {
        csvData1.push(row)
    })
    .on('end', async() => {
        //parsedRoles.push('wedding-planner')
        await csvData1.forEach(async element => {
            await parsedJobs.push(Object.values(element)[0])
        });
        //console.log(parsedJobs[0])
    })

    let csvData2 = []
    let parsedSalary = []
    const salary = await fs.createReadStream('salaries.csv')
    salary.pipe(parse({
        delimiter: ','
    })
    )
    .on('data', function (row) {
        csvData2.push(row)
    })
    .on('end', async() => {
        //parsedRoles.push('wedding-planner')
        await csvData2.forEach(async element => {
            await parsedSalary.push(Object.values(element)[0])
        });
        //console.log(parsedSalary[0])
    })


    let csvData3 = []
    let parsedSummary = []
    const summary = await fs.createReadStream('summary.csv')
    summary.pipe(parse({
        delimiter: ','
    })
    )
    .on('data', function (row) {
        csvData3.push(row)
    })
    .on('end', async() => {
        //parsedRoles.push('wedding-planner')
        await csvData3.forEach(async element => {
            await parsedSummary.push(Object.values(element)[0])
        });
        let i = 0
        let finalData = []
        let zeusData = zeus()
        console.log('asd')
        while(i<=420){
            let obj = {
                role : parsedRoles[i].trim(),
                salary : parsedSalary[i].trim(),
                jobcount : parsedJobs[i].trim(),
                summary : parsedSummary[i],
                details : zeusData[i].li
            }
            console.log(obj)
            finalData.push(obj)
            i++
        }
        const Prom1 = await new Scraping({
            data : finalData
        })
        await Prom1.save()
        res.send('mission accomplished')
    })
})

router.get('/final', async (req,res)=>{
    try {
        let i = 0
        let content = ''
        let arr = []
        const data = await Scraping.find();
        await data[0].data.forEach(async element => {
            content = await element.details.join('. ')
            arr.push(content)
            //console.log(content)
            // element.details.forEach(elements => {
            //     i++
            // });
        });
        await writeCsv(arr)
        console.log(arr)
        res.status(200).send('ok')
    } catch (error) {
        console.log(error)
    }
})
module.exports = router 