const mongoose = require ("mongoose")

const msgSchema = new mongoose.Schema({
    senderId: String,
    receiverId: String,
    messageContent: Object,
    messageId: {
        type: String,
        required: true
    },
    timestamp: String
});

const Message = mongoose.model('Message', msgSchema);

module.exports = (Message);