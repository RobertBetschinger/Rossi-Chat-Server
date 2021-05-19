require("dotenv").config();

const { response } = require("express");
const mongoose = require("mongoose");
const { options } = require("./router.js");
require("./models/user.model.js");
require("./models/message.model.js");
require("./models/key.model.js");
const User = mongoose.model("User");
const Message = mongoose.model("Message");
const KeyExchange = mongoose.model("KeyExchange");

function connect() {
  console.log("attempting connection");
  return mongoose.connect(
    "mongodb+srv://rossi-chat-server:" +
      process.env.MONGO_ATLAS_CREDS +
      "@cluster0.clgcc.mongodb.net/Rossi-Chat-App?retryWrites=true&w=majority",
    { useNewUrlParser: true, useUnifiedTopology: true }
    /*  ).then(() => 
  { console.log("Fianle Connection ist vorhanden")
return 1 },
  err => { console.log("Irgendwas ist schiefgegangen") }); */
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
  console.log("Connect.js addNewUser");
  try {
    var user = new User(userObject);
    user.save((err, doc) => {
      if (!err) {
        console.log("User added to db");
        return doc;
      }
    });
  } catch (error) {
    console.log(error);
    console.log("addNewUser failed");
  }
}

function findUserByNumber(number) {
  console.log("Connect.js findUserByNumber");
  try {
    console.log("Mit dieser Nummer suchen wir!" + number);
    const response = User.findOne({ number: number }, function (err, user) {
      console.log(
        "Entry found: %s %s %s",
        user.privateuserId,
        user.foreignId,
        user.number,
        user.spitzname
      );
    });
    return response;
  } catch (error) {
    console.log(error);
    console.log("findUserByNumber failed");
  }
}

async function findUserPermanentForeignId(seachForThatPermanentID) {
  console.log("Connect.js findUserPermanentForeignId");
  try {
    console.log("Mit dieser PermanentId suchen wir" + seachForThatPermanentID);
    const response = await User.findOne(
      { privateuserId: seachForThatPermanentID },
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
    console.log(response);
    console.log(
      "Diese zugehörige foreignID haben wir gefunden" + response.foreignId
    );
    return response.foreignId;
  } catch (error) {
    console.log(error);
    console.log("findUserPermanentForeignId failed");
  }
}

async function findUserPermanentId(seachForThatForeignID) {
  console.log("Connect.js findUserPermanentId");
  console.log("Mit dieser ForeignId suchen wir" + seachForThatForeignID);
  const response = await User.findOne(
    { foreignId: seachForThatForeignID },
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
  console.log(response);
  console.log(
    "Diese zugehörige privateId haben wir gefunden" + response.privateuserId
  );
  return response.privateuserId;
}

//MessagesAbteil Funktionen:AddMessage,findMessagesForUser

async function addMessage(messageobject) {
  console.log("Connect.js addMessage");
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
  console.log("Connect.js findMessagesForUser");
  console.log(
    "Das ist die ForeignId anhand der wir suchen" + recieverForeignID
  );
  try {
    var messages = [];
    messages = await Message.find(
      { receiverId: recieverForeignID },
      function (err, message) {
        if (err) return handleError(err);
        return messages;
      }
    );
  } catch (error) {
    console.log(error);
    console.log("findMessagesForUser failed");
  }
}

//Abteil Key Exchange: saveKeyExchangeObject

async function saveInitiateKeyExchange(exchangeObject) {
  console.log("Connect.js saveInitiateKeyExchange");
  try {
    console.log(exchangeObject);
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

async function searchForInitiatedExchanges(foreignId, privateId) {
  console.log("Connect.js searchForRequestedExchanges ");
  try {
    console.log("Mit dieser Foreign id : " + foreignId);
    exchangeObjects = await KeyExchange.find(
      { receiverForeignId: foreignId, status: "initiated" },
      function (err, message) {
        if (err) return handleError(err);
      }
    );
    return exchangeObjects;
    //das mit dem Löschen muss noch eingebaut werden.
  } catch (error) {
    console.log(error);
    return false;
  }
}

async function searchForAnsweredExchanges(privateId, foreignId) {
  console.log("Connect.js seachForAnsweredExchanges ");
  try {
    answeredExchangeObjects = await KeyExchange.find(
      {
        senderPrivateId: privateId,
        senderForeignId: foreignId,
        status: "answered",
      },
      function (err, message) {
        if (err) return handleError(err);
      }
    );
    console.log(typeof answeredExchangeObjects);
    return answeredExchangeObjects;
    //Das mit dem löschen muss noch eingebaut werden.
  } catch (error) {
    console.log(error);
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
  findUserPermanentId,
  findMessagesForUser,
  deleteMessage,
  changePhonenumber,
  changePseudonym,
  saveInitiateKeyExchange,
  searchForInitiatedExchanges,
  searchForAnsweredExchanges,
};
