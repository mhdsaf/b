const mongoose = require('mongoose');
const bcrypt = require('bcrypt')
const Advisor = require('../advisor/advisorCollection')
const jwt = require('jsonwebtoken')
const Schema = mongoose.Schema
const studentSchema = new mongoose.Schema({
    fname:{
        type: String,
        required: true
    },
    lname:{
        type: String,
        required: true
    },
    email:{
        type: String,
        unique: true,
        required: true
    },
    interests:{
        type: [String],
        enum: ['Math','Physics','Bio','Chemistry','Philosophy','Sport','Art','Political Science']
    },
    country:{
        type: String,
        enum:['United State','Lebanon','UAE']
    },
    password:{
        type: String,
        required: true
    },
    advisors:[{
        advisor:{
       ref: 'Advisor',
        type: Schema.Types.ObjectId 
        }
    }],
    tokens: [{
        token:{
            type:String
        }
    }],

    
}, {timestamps: true});

studentSchema.methods.addAdvisor = async function(email){
    const advisor = await Advisor.findOne({email:email})
    this.advisors = this.advisors.concat({advisor:advisor})
    await this.save()
}

studentSchema.methods.generateAuthToken = async function() {
    const token = jwt.sign({email: this.email},'fypfridaystudent', {expiresIn: '3600000'})
    this.tokens = this.tokens.concat({token: token})
    await this.save()

    return token
}
studentSchema.statics.findByCredentials = async (_email,_password)=>{
    const student = await Student.findOne({email: _email})
    if(!student){
        throw Error('incorrect user or password')
    }

    const isMatch = bcrypt.compare(_password,student.password)
    if(!isMatch){
        throw Error('incorrect user or password')
    }

    return student 
}
studentSchema.pre('save', async function(next) {
    this.password = await bcrypt.hash(this.password, 8)
    next()
});

const Student = mongoose.model('Student', studentSchema);
module.exports = Student;

