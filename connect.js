require("dotenv").config();

const { response } = require("express");
const mongoose = require("mongoose");
const { options } = require("./router.js");
require("./models/user.model.js");
require("./models/message.model.js");
const User = mongoose.model("User");
const Message = mongoose.model("Message");

function connect() {
  mongoose.connect(
    "mongodb+srv://rossi-chat-server:" +
    process.env.MONGO_ATLAS_CREDS +
    "@cluster0.clgcc.mongodb.net/Rossi-Chat-App?retryWrites=true&w=majority",
    { useNewUrlParser: true, useUnifiedTopology: true },
    (err) => {
      if (!err) {
        console.log("MongoDB connection succeeded");
      } else {
        return err;
      }
    }
  );
}

// Disconnect der DB optional
//function disconnect() {
//    mongoose.connection.close()
//};

function addNewUser(userObject) {
  var user = new User(userObject);
  user.save((err, doc) => {
    if (!err) {
      console.log("User added to db");
      return doc;
    }
  });
}

function findUserById(userId) {
  const responseobject = User.findOne({ userId: userId }, function (err, user) {
    response = false
    if (err) {
      return handleError(err)};
    console.log(
      "Entry found: %s %s %s",
      user.userId,
      user.number,
      user.pseudonym
    )
    response = true
  })
  console.log(typeof (responseobject))
  return response
}


function findUserByNumber(number) {
  const responseobject = User.findOne({ number: number }, function (err, user) {
    response = false
    if (err) {
      return handleError(err)
    };
    console.log(
      "Entry found: %s %s %s",
      user.userId,
      user.number,
      user.spitzname
    )
    response = true
  })
  console.log(typeof (responseobject))
  return response
};

function addMessage(message) {
  var messageadded = false;
  var message = new Message(message);
  message.save((err, doc) => {
    if (!err) {
      console.log("Message added to db");
      messageadded = true;
      return messageadded;
    }
  });
}

//Methode um 
function findMessagesForUser(messageId) {
  var messages = [];
  messages = Message.findOne({ messageId: messageId }, function (err, message) {
    if (err) return handleError(err);
    console.log(
      "Entry found: %s %s %s",
      message.messageId,
      message.creatorId,
      message.Message
    );
  });
  console.log(messages)
  return messages
}

//Brauchen wir anfangs nicht
function deleteMessage(messageId) {
  Message.findOneAndDelete({ messageId: messageId }, function (err, message) {
    if (err) return handleError(err);
    console.log(
      "Entry deleted: %s %s %s",
      message.messageId,
      message.creatorId,
      message.Message
    );
  });
}


function changePhonenumber(userId, newnumber) {
  const responseobject = User.findOneAndUpdate({ userId: userId },{$set: {number: newnumber}},{new: true}, function (err, user) {
    response = false
    if (err) {
      return handleError(err)};
    console.log(
      "Entry found: %s %s %s",
      user.userId,
      user.number,
      user.pseudonym
    )
    response = true
  })
  console.log(typeof (responseobject))
  return response
}

function changePseudonym(userId, newNickname) {
  const responseobject = User.findOneAndUpdate({ userId: userId },{$set: {spitzname: newNickname}},{new: true}, function (err, user) {
    response = false
    if (err) {
      return handleError(err)};
    console.log(
      "Entry found: %s %s %s",
      user.userId,
      user.number,
      user.pseudonym
    )
    response = true
  })
  console.log(typeof (responseobject))
  return response
}

module.exports = {
  connect,
  addNewUser,
  addMessage,
  findUserById,
  findUserByNumber,
  findMessagesForUser,
  deleteMessage,
  changePhonenumber,
  changePseudonym
};
