require("dotenv").config();

const { response } = require("express");
const mongoose = require("mongoose");
const { options } = require("./router.js");
require("./models/user.model.js");
require("./models/message.model.js");
require("./models/keyexchange.model.js")
const User = mongoose.model("User");
const Message = mongoose.model("Message");
const KeyExchange = mongoose.model("KeyExchange")

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
//Intern Docs
//TODO:
//Alles auf Try Catch umschreiben, damit der Server nicht abschmieren kann.
//Nachsehen ob man Dokumente automatisch löschen kann anhand von Timestamp /Lifetime


//Alle Funktionen die zum User Gehören. AddNewUser, FindUserByNumber, FindUserPermanentID

async function addNewUser(userObject) {
  console.log("Connect.js addNewUser")
  var user = new User(userObject);
  user.save((err, doc) => {
    if (!err) {
      console.log("User added to db");
      return doc;
    }
  });
}

function findUserByNumber(number) {
  console.log("Connect.js findUserByNumber")
  console.log("Mit dieser Nummer suchen wir!" + number)
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
  return response;
}
async function findUserPermanentForeignId(seachForThatPermanentID) {
  console.log("Connect.js findUserPermanentForeignId")
  console.log("Mit dieser PermanentId suchen wir" + seachForThatPermanentID);
  const response = await User.findOne( {privateuserId: seachForThatPermanentID },function (err, user) {
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
  console.log(response)
  console.log("Diese zugehörige foreignID haben wir gefunden" + response.foreignId)
  return response.foreignId;
}


//MessagesAbteil Funktionen:AddMessage,findMessagesForUser

async function addMessage(messageobject) {
  console.log("Connect.js addMessage")
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
    console.log("Coudnt add the message to db");
    return false;
  }
}

async function findMessagesForUser(recieverForeignID) {
  console.log("Connect.js findMessagesForUser")
  console.log("Das ist die ForeignId anhand der wir suchen" + recieverForeignID)
  var messages = []
  messages = await Message.find({ receiverId: recieverForeignID }, function (err, message) {
    if (err) return handleError(err);
  });
  return messages;
}


//Abteil Key Exchange: saveKeyExchangeObject

async function saveInitiateKeyExchange(exchangeObject){
  console.log("Connect.js saveInitiateKeyExchange")
  
  try {
    console.log(exchangeObject)
    var exchangeObject = new KeyExchange(exchangeObject);
    exchangeObject.save((err, doc) => {
      if (!err) {
        console.log("exchangeObject added to db");
        return true;
      }
    });
  } catch (error) {
    console.log(error);
    console.log("Coudnt add the keyExchangeObject to db");
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
  findUserByNumber,
  findUserPermanentForeignId,
  findMessagesForUser,
  deleteMessage,
  changePhonenumber,
  changePseudonym,
};
