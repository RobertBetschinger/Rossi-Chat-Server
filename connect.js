require("dotenv").config();

const mongoose = require("mongoose");
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
  User.findOne({ userId: userId }, function (err, user) {
    if (err) return handleError(err);
    console.log(
      "Entry found: %s %s %s",
      user.userId,
      user.number,
      user.pseudonym
    );
  });
}

 function findUserByNumber(number) {

  const response = User.findOne({ number: number }, function (err, user) {
    if (err) return handleError(err);
    console.log(
      "Entry found: %s %s %s",
      user.userId,
      user.number,
      user.spitzname
    )
})
console.log(typeof(response))
return response
};

function addMessage(message) {
  var message = new Message(message);
  message.save((err, doc) => {
    if (!err) {
      console.log("Message added to db");
      return doc;
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





module.exports = {
  connect,
  addNewUser,
  addMessage,
  findUserById,
  findUserByNumber,
  findMessagesForUser,
  deleteMessage,
};
