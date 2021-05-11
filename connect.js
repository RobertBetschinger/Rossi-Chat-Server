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

//Nicht asynchron
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
    response = false;
    if (err) {
      return handleError(err);
    }
    console.log(
      "Entry found: %s %s %s",
      user.userId,
      user.number,
      user.pseudonym
    );
    response = true;
  });
  console.log(typeof responseobject);
  return response;
}

function findUserByNumber(number) {
  const response = User.findOne({ number: number }, function (err, user) {
    if (err) return handleError(err);
    console.log(
      "Entry found: %s %s %s",
      user.privateuserId,
      user.foreignId,
      user.number,
      user.spitzname
    );
  });
  console.log(typeof response);
  return response;
}

function findMessagesForUser(receiverID) {
  messages = User.find({ receiverId: receiverID }, function (err, message) {
    if (err) return handleError(err);
  });
  return messages;
}

function findUserPermanentId(searchforthatforeignId) {
  console.log("Damit suchen wir" + searchforthatforeignId);
  const response = User.findOne(
    { foreignId: searchforthatforeignId },
    function (err, user) {
      if (err) return handleError(err);
      console.log(
        "Entry found: %s %s %s",
        user.privateuserId,
        user.foreignId,
        user.number,
        user.spitzname
      );
    }
  );
  console.log("das haben wir gefunden" + response.foreignId)
  return response.foreignId;
}

//Nicht asynchron
function addMessage(messageobject) {
  try {
    console.log(messageobject);
    var message = new Message(messageobject);
    message.save((err, doc) => {
      if (!err) {
        console.log("Message added to db");

        return true;
      }
    });
  } catch (error) {
    console.log(error);
    console.log("coudnt add the message to db");
    return false;
  }
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
  const responseobject = User.findOneAndUpdate(
    { userId: userId },
    { $set: { number: newnumber } },
    { new: true },
    function (err, user) {
      response = false;
      if (err) {
        return handleError(err);
      }
      console.log(
        "Entry found: %s %s %s",
        user.userId,
        user.number,
        user.pseudonym
      );
      response = true;
    }
  );
  console.log(typeof responseobject);
  return response;
}

function changePseudonym(userId, newNickname) {
  const responseobject = User.findOneAndUpdate(
    { userId: userId },
    { $set: { spitzname: newNickname } },
    { new: true },
    function (err, user) {
      response = false;
      if (err) {
        return handleError(err);
      }
      console.log(
        "Entry found: %s %s %s",
        user.userId,
        user.number,
        user.pseudonym
      );
      response = true;
    }
  );
  console.log(typeof responseobject);
  return response;
}

module.exports = {
  connect,
  addNewUser,
  addMessage,
  findUserById,
  findUserByNumber,
  findUserPermanentId,
  findMessagesForUser,
  deleteMessage,
  changePhonenumber,
  changePseudonym,
};
