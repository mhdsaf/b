const mongoose = require('mongoose');
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const Schema = mongoose.Schema
const advisorSchema = new mongoose.Schema({
 
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
        required: true
    },
    password:{
        type: String,
        required: true
    },
    status:{
        type:String,
        default:"pending"
    },
    students:[{
        ref: 'Student',
        type: Schema.Types.ObjectId
    }],
    tokens: [{
        token:{
            type:String
        }
    }]
}, {timestamps: true});

advisorSchema.methods.generateAuthToken = async function() {
    const token = jwt.sign({email: this.email},'fypfridaystudent' ,{expiresIn: '3600000'})
    
    this.tokens = this.tokens.concat({token: token})
    await this.save()

    return token
}
advisorSchema.statics.findByCredentials = async (_email,_password)=>{
    const advisor = await Advisor.findOne({email: _email})
    if(!advisor){
        throw Error('incorrect user or password')
    }

    const isMatch = bcrypt.compare(_password,advisor.password)
    if(!isMatch){
        throw Error('incorrect user or password')
    }

    return advisor
}
advisorSchema.pre('save', async function(next) {
    this.password = await bcrypt.hash(this.password, 8)
    next()
});

const Advisor = mongoose.model('Advisor', advisorSchema);
module.exports = Advisor;