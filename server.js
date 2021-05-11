var app = require("express")();
var server = require("http").createServer(app);
var io = require("socket.io")(server);
const cors = require("cors");
const router = require("./router");
const PORT = process.env.PORT || 5000;
const mongodb = require("./connect");

const User = require("./models/user.model");
const { resolve } = require("path");
const { rejects } = require("assert");

//Array with socketsId and the corresponding foreignID
const usersCurrentlyOnline = [];


io.on("connection", function (socket) {
  console.log("a user connected");
  //var connectionStatus = mongodb.connect();
  //console.log(connectionStatus);
  mongodb.connect()

  //Disconnect
  socket.on("disconnect", function () {
    console.log("a user disconnected");
    for (let i = 0; i < usersCurrentlyOnline.length; i++) {
      if (usersCurrentlyOnline[i].id === socket.id) {
        usersCurrentlyOnline.splice(i, 1);
      }
    }
  });

  //Re-Einloggen in das Netzwerk, trägt User in Currently Online DB ein
  socket.on("send-user-id", (arg1, arg2, answer) => {
    console.log("Server.Js send-user-id")
    console.log(arg1);
    usersCurrentlyOnline.push({
      id: socket.id,
      PermanentUserId:arg1,
      ForeignPermanentID: arg2,
    });
    answer(true);
  });

  //erstmaliges Einloggen
  socket.on("request-registration", async (object, answer) => {
    console.log("Server.Js request-registration")
    try {
      var privateid = ID();
      var forid = ID();
      const preUserObject = {
        privateuserId: privateid,
        foreignId: forid,
        number: object.phonenumber,
        // spitzname: "Beispielspitzname",
      };
      await mongodb.addNewUser(preUserObject);  
      answer(preUserObject);
    } catch (error) {
      console.error(error);
      //Auf Client Seite abfangen
      answer(false);
    }
  });

  //Privatchat eröffnen
  socket.on("request-chatpartner-receiverId", async function (object, answer) {
    console.log("Server.Js request-chatpartner-receiverId")
    console.log("Das ist die Nummer anhand er suchen soll" + object.phonenumber);
    try {
      var user = await mongodb.findUserByNumber(currentPhoneNumber);
      console.log(user.foreignId);
      answer(user.foreignId);      
    } catch (error) {
      answer(false)
    }
  });

  //Privatchat zwischen zwei Usern
  socket.on("send-chat-message-privat", async function (message, answer) {
    console.log("Server.Js send-chat-message-privat")
    console.log("das ist die ReceiverID" + message.foreignId);
    console.log( "Das ist die Wahrheit darüber ob der Chat Partner Online ist " +isOnline(message.foreignId));
    if (isOnline(message.foreignId)) {
      console.log("the current Chat partner ist online");
      try {
        var receiverSocketId = getSocketId(message.foreignId);
        socket.broadcast.to(receiverSocketId).emit("recieve-chat-message-private", message);
        console.log("Sended Message");
        answer(true);
      } catch (err) {
        console.log(err);
        answer(false);
      }
    } else {
      try {
        const messageObject = {
          messageId: message.messageId,
          senderId: message.senderId,
          timestamp: message.timestamp,
          messageContent: message.messageContent,
          receiverId: message.foreignId,
        };
        await mongodb.addMessage(messageObject);
        console.log("Message Added to DB")
        answer(true)
      } catch (err) {
        console.log(err);
        console.log("message could not be added to DB");
      }
    }
  });

  socket.on("got-new-messages?", async function (data, answer) {
    console.log("Server.Js got-new-messages?")
    //Als erstes überprüfen wir ob die ID berechtigt ist. erlaubt ist
    var matchingForeignId
    try {
      matchingForeignId = await mongodb.findUserPermanentForeignId(data.myprivateId)
      console.log("Das ist die zugehörige ForeignID" + matchingForeignId)
    } catch (error) {
      console.log(error)
      answer(false)
    }
    try {
      var yourMessages = [];
      yourMessages = await mongodb.findMessagesForUser(matchingForeignId);
      if (yourMessages.length >= 1) {
        console.log(yourMessages);
        answer(yourMessages);
      } else {
        console.log("No Messages for him, er hat keine Freunde")
        answer(false);
      }
    } catch (error) {
      console.log(error);
      answer(false);
    }
  });


  //Key Exchange Funktionen:
  socket.on("initiate-key-exchange", async function (data, answer) {
    console.log("Server.Js initiate-key-exchange")
    console.log(data.requesterPublicKey)
    try {
      var senderCorrespondingForeignId= await mongodb.findUserPermanentForeignId(data.senderPrivateId)
      console.log("Found that corresponding ForeignId" + senderCorrespondingForeignId)
    } catch (error) {
      console.log(error)
      answer(false)
    }
    if(senderCorrespondingForeignId == data.senderForeignId){
      try {
        console.log("User ist berechtigt einen KeyExchange zu starten.")
        const keyExchangeObject = {
          senderPrivateId: data.senderPrivateId,
          senderForeignId: data.senderForeignId,
          receiverForeignId: data.receiverForeignId,
          senderPublicKey: data.senderPublicKey,
          timestamp: data.timestamp,
        };
        await mongodb.addMessage(messageObject);
          console.log("Key ExchangeObject Added to DB")
          answer(true)
      } catch (error) {
        console.log(error)
        answer(false)
      }
    }else{
      console.log("User ist nicht berechtigt einen KeyExchange zu starten.")
      answer(false)
    }
  });
//Schnittstellen:

socket.on("test", async function (object, answer) {
  currentForeignId = object.foreignId;
  console.log(
    "das ist die ReceiverID falls er Online ist" + currentForeignId
  );
  var matchingPer = await mongodb.findUserPermanentId(someNumber);
  var machtingPermanentId = await mongodb.findUserByNumber(someNumber);
  var is = await mongodb.findMessagesForUser(skakas);
  var soaooas = await mongodb.addMessage(aksaskka)
  var saksa = await mongodb.addNewUser(asa)
});

  socket.on(
    "change-phonenumber",
    async function (userObject, newnumber, answer) {
      //Für Timo: Datenbankanbindung
      try {
        numberchanged = await mongodb.changePhonenumber(
          userObject.userId,
          newnumber
        );
        if (numberchanged === true) {
          answer(
            "Phonenumber of user" +
              userObject.userId +
              "has been changed to" +
              newnumber
          );
        }
      } catch {
        console.log(err);
        answer(false);
      }
    }
  );

  socket.on(
    "change-pseudonym",
    async function (userObject, newNickname, answer) {
      //Für Timo: Datenbankanbindung
      try {
        nicknamechanged = await mongodb.changePseudonym(
          userObject.userId,
          newNickname
        );
        if (nicknamechanged === true) {
          answer(
            "Phonenumber of user" +
              userObject.userId +
              "has been changed to" +
              newNickname
          );
        }
      } catch {
        console.log(err);
        answer(false);
      }
    }
  );
});

//
//Funktionen Die nicht im Socket.io event stattfinden
//

function lookUpChatPartners(chatId) {
  //Searches in ChatDatabase all Chat pArtners, returns array
}

function getSocketId(recevierId) {
  for (let i = 0; i < usersCurrentlyOnline.length; i++) {
    if (usersCurrentlyOnline[i].ForeignPermanentID === recevierId) {
      //Return Socket ID
      console.log(usersCurrentlyOnline[i].id);
      return usersCurrentlyOnline[i].id;
    }
  }
  return null;
}

//Muss auf ForeignKey umgestellt werden.
function isOnline(onlinePermanentId) {
  for (let i = 0; i < usersCurrentlyOnline.length; i++) {
    if (usersCurrentlyOnline[i].ForeignPermanentID === onlinePermanentId) {
      return true;
    }
  }
  return false;
}

var ID = function () {
  // Math.random should be unique because of its seeding algorithm.
  // Convert it to base 36 (numbers + letters), and grab the first 9 characters
  // after the decimal.
  return "_" + Math.random().toString(36).substr(2, 9);
};

//This Part has to be at the bottom of the Code
app.use(router);
app.use(cors());
server.listen(PORT, () => console.log("Server has started on Port: " + PORT));
