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
    },
    dateCreated:{
        type:Date,
        default:Date.now(),
        expires:900
    }
})