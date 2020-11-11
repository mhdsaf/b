const mongoose = require('mongoose');
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
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
    tokens: [{
        token:{
            type:String,
            required: true
        }
    }]
}, {timestamps: true});

studentSchema.methods.generateAuthToken = async function() {
    const token = jwt.sign({_id: this._id.toString()},'FypFriday')
    
    this.tokens = this.tokens.concat({token: token})
    await this.save()

    return token
}
studentSchema.statics.findByCredentials = async (_email,_password)=>{
    const student = await Model.findOne({email: _email})
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

const Model = mongoose.model('Students', studentSchema);
module.exports = Model;