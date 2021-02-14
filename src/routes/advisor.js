const express = require('express')
const Advisor = require('../models/advisor/advisorCollection')
const imageToBase64 = require('image-to-base64')
const axios = require('axios')
const router = new express.Router()
const multer = require('multer')


router.post('/advisors/signup', async(req, res)=>{
    try {
        let base64 = ''
        await imageToBase64(req.body.image).then((response) => {
            base64 = response
        }
        ).catch((error) => {
                console.log(error)
            }
        )
        let advisor = await new Advisor({
            fname: req.body.fname,
            lname: req.body.lname,
            email: req.body.email,
            linkedin: req.body.linkedin,
            university: req.body.university,
            major: req.body.major,
            image: base64
        })
        await advisor.save()
        res.status(200).send({message: 'success'})
    } catch (error) {
        console.log(error)
        res.status(400).send({message: 'Missing field(s)'})
    }
})

router.post('/advisors/photo', async(req, res)=>{
    console.log('here')
    axios.get(`https://www.linkedin.com/oauth/v2/accessToken?grant_type=authorization_code&client_id=78q6bhbb9echn1&client_secret=VQv1aFXO79k5obyL&code=${req.body.code}&redirect_uri=http://localhost:3000/advisors`, ).then((response)=>{
        let config = {
            headers: {
                Authorization: `Bearer ${response.data.access_token}`
            }
        }
        axios.get(`https://api.linkedin.com/v2/me?projection=(id,firstName,lastName,profilePicture(displayImage~:playableStreams))`, config).then((response)=>{
            let arr = [...response.data.profilePicture['displayImage~'].elements]
            let index = arr.length-1
            console.log(arr[index].identifiers[0].identifier)
            res.status(200).send({image: arr[index].identifiers[0].identifier})
        }).catch((err)=>{
            console.log(err)
        })
    }).catch((err)=>{
        res.status(400).send({msg: "error"})
    })
})

module.exports = router