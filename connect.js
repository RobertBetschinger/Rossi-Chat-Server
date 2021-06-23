require("dotenv").config();

const { response } = require("express");
const mongoose = require("mongoose");
const { options } = require("./router.js");
require("./models/user.model.js");
require("./models/message.model.js");
require("./models/key.model.js");
require("./models/messagebird.model.js");
const User = mongoose.model("User");
const Message = mongoose.model("Message");
const Bird = mongoose.model("Bird");
const KeyExchange = mongoose.model("KeyExchange");

function connect() {
  console.log("attempting connection");
  return mongoose.connect(
    "mongodb+srv://rossi-chat-server:" +
    process.env.MONGO_ATLAS_CREDS +
    "@cluster0.clgcc.mongodb.net/Rossi-Chat-App?retryWrites=true&w=majority",
    { useNewUrlParser: true, useUnifiedTopology: true,useCreateIndexes:true }

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

function addNewUser(userObject) {
  console.log("Connect.js addNewUser");
  try {
    var user = new User(userObject);
    return new Promise((resolve, reject) => {
      user.save((err, doc) => {
        if (err) {
          reject(err);
        }
        else {
          resolve(doc.toObject());
        }
      })
    });
  } catch (error) {
    console.log(error);
    console.log("addNewUser failed");
    return error
  }
}

/* async function addNewUser(userObject){
  console.log("Connect.js addNewUser");
  try {
    var user = new User(userObject);
    user.save((err, doc) => {
      if (!err) {
        console.log("User added to db");
        return true;
      }
    });
  } catch (error) {
    
  }
} */



async function identifyUser(privId, forId, number) {
  console.log("Connect.js Identify User");
  // console.log(privId,forId,number)
  try {
    const response = await User.findOne({ privateuserId: privId, foreignId: forId, number: number }, function (err, user) {
      if (err) return false
    })
    if (response.privateuserId == privId && response.foreignId == forId && response.number == number) return response
    else return false
    console.log(response)
  } catch (error) {
    console.log(error)
    return false
  }
}

function findUserByNumber(number) {
  console.log("Connect.js findUserByNumber");
  try {
    console.log("Mit dieser Nummer suchen wir!" + number);
    return new Promise((resolve, reject) => {
      const response = User.findOne({ number: number }, function (err, user) {
        if (err) {
          reject(err)
        }
        else {
          resolve(user)
        }
      });
    })
  } catch (error) {
    console.log("findUserByNumber failed");
    console.log(error);
  }
};

function findExistingRegistration (number) {
  console.log("Checking for existing Registrations with number: " + number);
  try{
    return new Promise((resolve,reject)=> {
      User.exists({number : number}, function (err, status){
        if(err) {
          reject(err);
        }
        else {
          resolve(status);
        }
      })
    })
  } catch (error) {
    console.log("Search for existing Registrations failed")
    console.log(error);
  }
};

function deleteUserDataFromDB (privateid, phonenumber) {
  console.log("Starting removal of User with id: " + privateid);
  try{
    const userstatus = new Promise((resolve,reject)=> {
      User.findOneAndDelete({privateuserId : privateid}, function (err, status){
        if(err) {
          reject(err);
        }
        else {
          resolve(status);
        }
      })
    })
    const messagestatus = new Promise((resolve,reject)=> {
      Message.deleteMany({ receiverId : privateid }, function (err, status) {
        if(err) {
          reject(err);
        }
        else {
          resolve(status);
        }
      })
    })
    const keystatus = new Promise((resolve,reject) => {
      KeyExchange.deleteMany({senderPrivateId : privateid }, function (err, status) {
        if(err) {
          reject(err);
        }
        else {
          resolve(status);
        }
      })
    })
    const birdstatus = new Promise((resolve,reject) => {
      Bird.findOneAndDelete({phonenumber : phonenumber}, function (err, status) {
        if(err) {
          reject(err);
        }
        else {
          resolve(status);
        }
      })
    })
    Promise.all([userstatus, messagestatus, keystatus, birdstatus]).then((values) => {
      return values
    });
  } catch (error) {
    console.log("Deletion of User Data failed")
    console.log(error);
  }
};

function addNewSMSRegistration(id, number) {
  try {
    console.log("Adding new SMS Registration to DB");
    const birdobject = {
      birdId: id,
      phonenumber: number
    }
    var bird = new Bird(birdobject);
    return new Promise((resolve, reject) => {
      bird.save((err, doc) => {
        if (err) {
          reject(err);
        }
        else {
          resolve(doc);
        }
      })
    })
  } catch (error) {
    console.log(error)
  }
};

function findUserByNumberInMessagebird(number) {
  console.log("Atempting to find user BirdId in DB")
  try {
    return new Promise((resolve, reject) => {
      var id = Bird.findOne({ phonenumber: number }, function (err, doc) {
        if (err) {
          reject(err);
        }
        else {
          resolve(doc)
        }
      });
    })
  } catch (error) {
    console.log(error)
  }
};


function updateUserVerificationStatus(mongodbId) {
  return new Promise((resolve, reject) => {
    filter = {_id: mongodbId};
    update = {$set:{verified: true}};
    User.findOneAndUpdate(filter, update, {useFindAndModify: false}, { new: true }, (err, doc) => {
      if (err) {
        reject(err);
      }
      else {
        resolve(doc);
      }
    })
  })
};



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
    var messagesencoded = [];
    messages = await Message.find(
      { receiverId: recieverForeignID }).lean().sort('timestamp');
    messages.forEach(message => messagesencoded.push({
      "messageId": message.messageId,
      "senderId": message.senderId,
      "foreignId": message.receiverId,
      "messageContent": message.messageContent,
      "timestamp": message.timestamp,
      "forwardKey": message.forwardKey,
      "contentType": message.contentType,
      "chatId": message.chatId
    }))
    return messagesencoded
  } catch (error) {
    console.log(error);
    console.log("findMessagesForUser failed");
  }
}

async function findReceivedMessages(senderForeignId) {
  console.log("Connect.js findReadMessages");
  try {
    var messages = [];
    var messagesencoded = [];
    messages = await Message.find({
      senderId: senderForeignId,
      status: "ClientReceived",
    }).lean();
    messages.forEach((message) => messagesencoded.push(message.messageId));
    return messagesencoded;
  } catch (error) {
    console.log(error);
    console.log("findReadMessages failed");
  }
}

async function replaceMessage(messageObject) {
  console.log("Connect.js replaceMessage");
  try {
    //Replaces old Messages. So kann Verbindlichkeit gergestellt werden.
    status = await Message.findOneAndReplace(
      { messageId: messageObject.messageId },
      messageObject
    );
    console.log(status);
    console.log("Message was overwritten.");
    return true;
  } catch (error) {
    console.log(error);
    console.log("Overwride of the Old Message failed");
    return false;
  }
}

async function senderForeignIdWithMessageId(messageId) {
  console.log("Connect.js senderForeignIDFormessageID");
  try {
    var message = await Message.findOne({ senderId: messageId });
    console.log(message.senderId);
    //SenderId = ForeignID of Sender
    return message.senderId;
  } catch (error) {
    console.log(error);
    console.log("findForeignIDforUser failed");
  }
}

async function deleteMessage(deleteMessages) {
  console.log("Connect.js findMessagesForUser");
  try {
    Message.deleteOne({ messageId: { $in: deleteMessages } }),
      function (err, message) {
        if (err) return handleError(err);
      };
  } catch (error) {
    console.log(error);
    console.log("Message wasnt saved Online, so it failed");
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

async function searchForInitiatedSingleExchange(permanentID, foreignID,ChatId) {
  console.log("Connect.js searchForRequestedSingleExhange to overwrite ");
  try {
    console.log("Mit dieser Foreign id : " + foreignID);
    exchangeObject = await KeyExchange.find(
      { senderPrivateId: permanentID,senderForeignId:foreignID,status: "initiated",chatId:ChatId },
      function (err, message) {
        if (err) return false
      }
    );
    return exchangeObject;
  } catch (error) {
    console.log(error);
    return false;
  }
}

async function overWriteSingleExchangeObject(permanentID, foreignID, answeredKey, cId) {
  console.log("Connect.js searchForRequestedSingleExhange and overwrite itoverwrite ");
  try {
    console.log("Mit dieser Foreign id : " + foreignID);
    var query = {senderPrivateId: permanentID,senderForeignId:foreignID,status: "initiated"}
    exchangeObject = await KeyExchange.findOneAndUpdate(
      {query,$set: { status: "answered",senderPublicKey: answeredKey, chatId: cId}}, { new: true },
      function (err, message) {
        if (err) return handleError(err);
      }
    );
    return exchangeObject;
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
  } catch (error) {
    console.log(error);
    return false;
  }
}

async function deleteKeyExchange(deleteThisKey) {
  console.log("Connect.js findMessagesForUser");
  try {
   deleteKey=  await KeyExchange.deleteOne({ _id: deleteThisKey }),
      function (err, message) {
        if (err) return handleError(err);
      };
      console.log(deleteKey)
      return deleteKey
  } catch (error) {
    console.log(error);
    console.log("deleteThisKey failed");
  }
}

function changePhonenumber(userId, newnumber) {
  return ("not implemented");
}

function changePseudonym(userId, newNickname) {
  return("not implemented");
}

module.exports = {
  connect,
  addNewUser,
  addMessage,
  identifyUser,
  findUserByNumber,
  findUserPermanentForeignId,
  findUserPermanentId,
  findMessagesForUser,
  findReceivedMessages,
  senderForeignIdWithMessageId,
  replaceMessage,
  deleteMessage,
  changePhonenumber,
  changePseudonym,
  saveInitiateKeyExchange,
  overWriteSingleExchangeObject,
  searchForInitiatedSingleExchange,
  searchForInitiatedExchanges,
  searchForAnsweredExchanges,
  deleteKeyExchange,
  addNewSMSRegistration,
  findUserByNumberInMessagebird,
  updateUserVerificationStatus,
  findExistingRegistration,
  deleteUserDataFromDB,
};
