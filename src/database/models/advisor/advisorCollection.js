const mongoose = require('mongoose');
const bcrypt = require('bcrypt')
const advisorModel = new mongoose.Schema({
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
    }
}, {timestamps: true});

advisorModel.pre('save', async function(next) {
    this.password = await bcrypt.hash(this.password, 8)
    next()
});

const Model = mongoose.model('Advisors', advisorModel);
module.exports = Model;