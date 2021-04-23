const mongoose = require ("mongoose");

const userSchema = new mongoose.Schema({
    userId: {
        type: String,
    },
    number: {
        type: String,
    },
    spitzname: {
        type: String,
    },
});

const User = mongoose.model('User', userSchema);

module.exports =(User);