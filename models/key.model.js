const mongoose = require("mongoose");

const keyExchangeSchema = new mongoose.Schema(
  {
    senderPrivateId: String,
    senderForeignId: String,
    receiverForeignId: String,
    senderPublicKey: String,
    timestamp: String,
    status: String,
    chatId: String,
    groupName: String,
    phoneNumber: String,
    force: Boolean, 
  },
  { versionKey: false }
);

const KeyExchange = mongoose.model("KeyExchange", keyExchangeSchema);

module.exports = KeyExchange;
