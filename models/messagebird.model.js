const mongoose = require("mongoose");

const birdSchema = new mongoose.Schema(
  {
    birdId: "",
    phonenumber: "",
  }
);

const Bird = mongoose.model("Bird", birdSchema);

module.exports = (Bird);
