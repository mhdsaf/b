const express = require('express');

const router = new express.Router();

router.get('/students', (req,res)=>{
    res.send({
        students: 'Wehbe'
    })
})
module.exports = router