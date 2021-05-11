const mongoose = require("mongoose");

const keyExchangeSchema = new mongoose.Schema(
  {
    senderPrivateId: String,
    senderForeignId: String,
    receiverForeignId: String,
    senderPublicKey: String,
    timestamp: String,
  },
  { versionKey: false }
);

const KeyExchange = mongoose.model("keyExchange", keyExchangeSchema);

module.exports = KeyExchange;
