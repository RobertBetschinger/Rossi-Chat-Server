const mongoose = require("mongoose");

const msgSchema = new mongoose.Schema(
  {
    messageId: {
      type: String,
      required: true,
    },
    senderId: String,
    timestamp: String,
    messageContent: String,
    receiverId: String,
    status: String,
  },
  { versionKey: false }
);

const Message = mongoose.model("Message", msgSchema);

module.exports = Message;
