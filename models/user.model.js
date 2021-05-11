const mongoose = require ("mongoose");

const userSchema = new mongoose.Schema({
    privateuserId: {
        type: String,
        required: true,
    },
    foreignId:{
        type: String,
        required:true,
    },
    number: {
        type: String,
        required: true,
    },
    spitzname: {
        type: String,
        required: false,
    },
},
{ versionKey: false }
);

const User = mongoose.model('User', userSchema);

module.exports =(User);