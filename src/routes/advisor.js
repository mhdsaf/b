const express = require('express');
// require advisor database to use it
const advisor = require('../database/models/advisor/advisorCollection')

const router = new express.Router();

router.get('/advisors', (req,res)=>{
    res.send({
        students: 'Malka'
    })
})

router.post('/advisorSignup', async(req, res)=>{
    try {
        let adv = await new advisor({
            fname: req.body.fname,
            lname: req.body.lname,
            email: req.body.email,
            password: req.body.password
        });
        await adv.save();
        console.log('Save runs')
        res.status(201).send({message: "Successfully signed up"})
    } catch (error) {
        res.status(400).send({message: 'Missing field(s)'})
    }
})
module.exports = router