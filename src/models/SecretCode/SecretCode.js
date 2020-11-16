const mongoose = require('mongoose')
const Schema = mongoose.Schema

const SecretCodeSchema = new Schema({
    email:{
        type:String,
        unique: true,
        required: true
    },
    code:{ 
        type:String,
        required:true,
        unique:true
    },
    dateCreated:{
        type:Date,
        default:Date.now(),
        expires:900
    }
})

const Model = mongoose.model('secret-code',SecretCodeSchema)
module.exports = Model