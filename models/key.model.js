const mongoose = require("mongoose");

const keyExchangeSchema = new mongoose.Schema(
  {
    senderPrivateId: String,
    senderForeignId: String,
    receiverForeignId: String,
    senderPublicKey: String,
    timestamp: String,
    forwardkey: String,
    status: String,
  },
  { versionKey: false }
);

const KeyExchange = mongoose.model("KeyExchange", keyExchangeSchema);

module.exports = KeyExchange;
