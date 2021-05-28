const mongoose = require("mongoose");

const birdSchema = new mongoose.Schema(
  {
    birdId: String,
    phonenumber: String,
  }
);

const Bird = mongoose.model("Bird", birdSchema);

module.exports = (Bird);
