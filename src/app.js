const express = require('express')

const cors = require('cors')

require('./database/dbConnect')

const app = express()

const studentRouter = require("./routes/student")

const advisorRouter = require("./routes/advisor")

app.use(express.json(), cors())

const port = 4200

app.use(studentRouter)

app.use(advisorRouter)

app.listen(port,()=>{
    console.log(`Server is running on port ${port}`)
})

app.get('', (req, res)=>{
    res.send({
        name: 'Safo'
    })
})