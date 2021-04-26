const mongoose = require ("mongoose");

const userSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
    },
    number: {
        type: String,
        required: true,
    },
    spitzname: {
        type: String,
        required: false,
    },
});

const User = mongoose.model('User', userSchema);

module.exports =(User);