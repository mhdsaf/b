const express = require('express')
const Student = require('../models/student/studentCollection')
const studentAuth =  require('../middleware/studentAuth')
const scrapeMostDemandedJobs = require('../generalPurposeFunctions/scrape/scrapeMostDemanded')
const jwt = require('jsonwebtoken')
const scrapeAllRoles = require('../generalPurposeFunctions/scrape/scrapeAllRoles')
const router = new express.Router()
const Scraping = require('../models/scraping/scrapingCollection')
const welcomeEmail = require('../generalPurposeFunctions/Emails/welcomeEmail')
const zeus = require('../generalPurposeFunctions/scrape/scrapeRolesDetails/try')
const bcrypt = require('bcrypt')
const resetPasswordEmail = require('../generalPurposeFunctions/Emails/resetPasswordEmail')
const writeCsv = require('../generalPurposeFunctions/scrape/csvWriteTemplate')
const getSkills = require('../generalPurposeFunctions/scrape/scrapeRolesSkills/scrapeRolesSkills')
const Roles = require('../models/roles/roles')
const multer = require('multer')
const sharp = require('sharp')
const Advisor = require('../models/advisor/advisorCollection')

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
            didTakeTest: student.didTakeTest,
            id: student._id
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

router.patch('/students/fname', studentAuth, async (req, res)=>{
    try {
        const student = await Student.findOne({email: req.studentemail})
        student.fname = req.body.fname
        await student.save()
        res.status(200).send('Fname changed successfully')
    } catch (e) {
        res.status(400).send({error: e.message})
    }
})

router.patch('/students/lname', studentAuth, async (req, res)=>{
    try {
        const student = await Student.findOne({email: req.studentemail})
        student.lname = req.body.lname
        await student.save()
        res.status(200).send('Lname changed successfully')
    } catch (e) {
        res.status(400).send({error: e.message})
    }
})

const uploadFile = multer({ 
    limits:{
        fileSize: 1000000 // unit in bytes,
    },
    fileFilter(req, file, cb){
        cb(undefined, true);
    }
})

router.post('/students/photo', studentAuth, uploadFile.single('upload1'), async (req,res)=>{
    const student = await Student.findOne({email:req.studentemail})
    let buffer = await sharp(req.file.buffer).resize({width: 120, height: 120}).png().toBuffer()
    student.image = buffer
    await student.save()
    let bufferOriginal = student.image
    let imageBase64 = Buffer.from(bufferOriginal).toString('base64')
    res.send({image: imageBase64})
}, (err, req, res, next)=>{
    res.status(401).send({Error: err.message})
})

router.delete('/students/photo', studentAuth, async (req,res)=>{
    const student = await Student.findOne({email:req.studentemail})
    student.image = undefined;
    await student.save();
    res.send("Successfully deleted")
});

router.get('/students/photo', studentAuth, async (req,res)=>{
    const student = await Student.findOne({email:req.studentemail})
    if (student.image!=undefined) {
        let bufferOriginal = student.image;
        let imageBase64 = Buffer.from(bufferOriginal).toString('base64');
        res.send({image: imageBase64, timestamp: student.createdAt, fname: student.fname, lname: student.lname});
    } else {
        res.status(200).send({timestamp: student.createdAt, fname: student.fname, lname: student.lname, error: "notfound"});
    }
})

router.post('/students/add-advisor', studentAuth, async(req,res)=>{
     try{
        const student = await Student.findOne({email:req.studentemail})
        const addAdvisor = await student.addAdvisor(req.body.email)
        res.status(200).send("advisor added")
        }
        catch(e){
            res.status(400).send({error: e.message})
        }
})

router.patch('/students/changepassword', studentAuth, async(req,res)=>{
    try{
       const student = await Student.findOne({email:req.studentemail})
       const isMatch = await bcrypt.compare(req.body.oldPass, student.password)
       if(!isMatch){
           res.status(200).send('no match')
        }else{
            const hashedPass = await bcrypt.hash(req.body.newPass, 8)
            student.password = hashedPass
            await student.save()
            res.status(200).send('match')
        }
       }
       catch(e){
           res.status(400).send({error: e.message})
       }
})

router.get('/students/retreiveallroles', async (req, res)=>{
    try {
        let roles = await Roles.find()
        let filteredRoles = []
        roles.forEach(element => {
            filteredRoles.push(element.role)  
        })
        res.status(200).send(filteredRoles)
    } catch (error) {
        console.log(error)
        res.status(401).send('error')
    }
})

router.get('/students/allroles', studentAuth, async (req, res)=>{
    try {
        const allRoles = await Roles.find()
        res.status(201).send(allRoles)
    } catch (error) {
        res.status(400).send('error')
    }
})

router.get('/students/specificrole/:role', async (req, res)=>{
    const roles = await Roles.findOne({role: req.params.role})
    res.status(201).send(roles)
})

router.get('/students/entrylevel', async (req, res)=>{ // returns number of entry level roles
    const roles = await Roles.find()
    const advisors = await Advisor.find()
    let total = 0
    await roles.forEach(element => {
        total = total + element.sortJobs
    })
    // res.sendStatus(201).send(total)
    res.status(201).send({data:total, advisors: advisors.length})
})

router.get('/students/majors', studentAuth, async (req, res)=>{
    const roles = await Roles.find()
    const majors = []
    roles.forEach(element => {
        majors.push(element.role)
    })
    res.status(201).send(majors)
})

router.post('/students/connect', studentAuth, async (req, res)=>{
    try {
        const advisor = await Advisor.findById(req.body.id)
        const student = await Student.findOne({email: req.studentemail})   
        let arr = [...student.advisors]
        let arr1 = [...advisor.students]
        if(arr.includes(req.body.id)){
            throw new Error('You are already connected to this advisor')
        }
        arr.push(advisor._id)
        student.advisors = [...arr]
        arr1.push(student._id)
        advisor.students = [...arr1]
        await student.save()
        await advisor.save()
        res.status(200).send(student)
    }catch (error) {
        res.status(400).send('error')
        console.log(error)
    }
})

router.get('/students/myadvisors', studentAuth, async(req, res)=>{
    try {
        const myAdvisors = await Student.findOne({email: req.studentemail})
        if(myAdvisors.advisors.length===0){
            res.status(200).send('')
        }else{
            let arr = []
            const sendRequest = ()=>{
                res.status(200).send(arr)
            }
            await myAdvisors.advisors.forEach( async (element, index)=>{
                let advisor = await Advisor.findById(element)
                arr.push(advisor)
                if(index+1===myAdvisors.advisors.length){
                    sendRequest()
                }
            })
        }
    } catch (error) {
        res.status(400).send('error')
    }
})

router.get('/students/isadvisor/:id', studentAuth, async(req, res)=>{
    try {
        const advisor = await Advisor.findById(req.params.id)
        if(advisor){
            res.status(200).send(true)
        }else{
            res.status(200).send(false)
        }
    } catch (error) {
        res.status(400).send('error')
    }
})

router.post('/students/removeadvisor', studentAuth, async(req, res)=>{
    try {
        const student = await Student.findOne({email: req.studentemail})
        const advisor = await Advisor.findById(req.body.id)
        let arr = [...student.advisors]
        arr.splice(arr.indexOf(req.body.id), 1)
        student.advisors = [...arr]
        let arr1 = [...advisor.students]
        arr1.splice(arr.indexOf(student._id), 1)
        advisor.students = [...arr1]
        await student.save()
        await advisor.save()
        res.status(200).send(true)
    } catch (error) {
        res.status(400).send('error')
    }
})

router.post('/students/testevaluation', studentAuth, async(req, res)=>{
    // ComputerScience
    // Math
    // Physics
    // English
    // Biology
    // Chemistry
    // TakeCareOfPeople
    // StandardizedTest
    // Programming
    // Writing
    // Communication
    // Design
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

router.get('/find', async (req, res)=>{
    try {
        const data = await Scraping.findById('5fea3afcb7f0ab11e0728fcf')
        const skills = await getSkills()
        await skills.forEach((element, index) => {
            let arr = []
            arr.push(element)
            data.data[index].requirements = arr
        })
        await data.save()
        res.status(200).send('done')
    } catch (error) {
        console.log(error)
    }
})
router.get('/toexcel', async (req, res)=>{
    try {
        const data = await Scraping.findById('5fea3afcb7f0ab11e0728fcf')
        let arr = []
        let x = ''
        let count = 0
        for (let i = 0; i <= 420; i++) {
            if(data.data[i].requirements[0].qualifications.length>1){
                x = data.data[i].requirements[0].qualifications.join('. ')
            }else{
                count++
                x = ''
            }
            arr.push(x)
        }
        await writeCsv(arr)
        res.send({msg: 'Done'})
        //console.log(data.data[0].requirements)
        //console.log(data.data[0].requirements[0].skills)
        //data.data[0].requirements[0].skills
        //data.data[0].requirements[1].qualifications
    } catch (error) {
        console.log(error)
    }
})
module.exports = router 