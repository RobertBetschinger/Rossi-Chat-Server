const mongoose = require ("mongoose")

const msgSchema = new mongoose.Schema({
    messageId: {
        type: String,
        required: true
    },
    creatorId: String,
    timestamp: String,
    Message: Object,
    Pseudonym: String,
    receiverId:String
});

const Message = mongoose.model('Message', msgSchema);

module.exports = (Message);