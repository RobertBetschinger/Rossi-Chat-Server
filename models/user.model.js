const mongoose = require ("mongoose");

const userSchema = new mongoose.Schema({
    _id: {
        type: String,
        unique: true,
        required: true,
    },
    privateuserId: {
        type: String,
        unique: true,
        required: true,
    },
    foreignId:{
        type: String,
        unique:true,
        required:true,
    },
    number: {
        type: String,
        unique:true,
        required: true,
    },
    spitzname: {
        type: String,
        required: false,
    },
    verified: {
        type: Boolean,
        required: true,
    },
},
{ versionKey: false },
{ _id: false }
);

const User = mongoose.model('User', userSchema);

module.exports =(User);