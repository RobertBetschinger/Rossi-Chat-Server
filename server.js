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
const { response } = require("express");

const messagebird = require("messagebird")(process.env.MSGBIRD_TEST_ACCESS_KEY);

//Array with socketsId and the corresponding foreignID
const usersCurrentlyOnline = [];



mongodb.connect().then(() => {
console.log("Connection zu MongoDB ist aufgebaut") 
createServer()},
err => { 
console.log("Keine Connection Zu MongoDB Möglich. Server wird nicht gestartet")
console.log(err)})


io.on("connection", function (socket) {
  console.log("a user connected");
  //var connectionStatus = mongodb.connect();
  //console.log(connectionStatus);
  

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
  socket.on("send-user-id", async (arg1, arg2, answer) => {
    console.log("Server.Js send-user-id");
    console.log(arg1);
    usersCurrentlyOnline.push({
      id: socket.id,
      PermanentUserId: arg1,
      ForeignPermanentID: arg2,
    });
  });

  //erstmaliges Einloggen
  socket.on("request-registration", async (object, answer) => {
    console.log("Server.Js request-registration");
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
    console.log("Server.Js request-chatpartner-receiverId");
    console.log(
      "Das ist die Nummer anhand er suchen soll" + object.phonenumber
    );
    try {
      var user = await mongodb.findUserByNumber(object.phonenumber);
      console.log(user.foreignId);
      answer(user.foreignId);
    } catch (error) {
      console.log(error);
    }
  });

  //Privatchat zwischen zwei Usern
  socket.on("send-chat-message-privat", async function (message, answer) {
    console.log("Server.Js send-chat-message-privat");
    console.log("das ist die ReceiverID" + message.foreignId);
    console.log(
      "Das ist die Wahrheit darüber ob der Chat Partner Online ist " +
        isOnline(message.foreignId)
    );
    if (isOnline(message.foreignId)) {
      console.log("the current Chat partner ist online");
      try {
        var receiverSocketId = getSocketId(message.foreignId);
        socket.broadcast
          .to(receiverSocketId)
          .emit("recieve-chat-message-private", message);
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
        console.log("Message Added to DB");
        answer(true);
      } catch (err) {
        answer(false)
        console.log(err);
        console.log("message could not be added to DB");
      }
    }
  });

  socket.on("got-new-messages?", async function (data, answer) {
    console.log("Server.Js got-new-messages?");
    //Als erstes überprüfen wir ob die ID berechtigt ist. erlaubt ist
    var matchingForeignId;
    try {
      matchingForeignId = await mongodb.findUserPermanentForeignId(
        data.myprivateId
      );
      console.log("Das ist die zugehörige ForeignID" + matchingForeignId);
    } catch (error) {
      console.log(error);
      answer(false);
    }
    try {
      var yourMessages = [];
      yourMessages = await mongodb.findMessagesForUser(matchingForeignId);
      if (yourMessages.length >= 1) {
        console.log(yourMessages);
        answer(yourMessages);
      } else {
        console.log("No Messages for him, er hat keine Freunde");
        answer(false);
      }
    } catch (error) {
      console.log("No Messages for him, er hat keine Freunde");
      console.log(error);
      answer(false);
    }
  });

  socket.on("message-received", async(data,answer)=>{
    //Auth muss noch  eingebaut werden.
    console.log("Server.js messsage-received")
    console.log(data)
    console.log(data.messageId)
    try {
      await mongodb.deleteMessage(data.messageId)
      answer(true)
    } catch (error) {
      console.log(error)
      console.log("Nachrichte konnten nicht gelöscht werden.")
      answer(false)
    }

  })


  //Instant einrichten
  //Key Exchange Funktionen:
  socket.on("initiate-key-exchange", async (data, answer) => {
    console.log("Server.Js initiate-key-exchange");
    console.log(data.requesterPublicKey);
    try {
      var senderCorrespondingForeignId =
        await mongodb.findUserPermanentForeignId(data.senderPrivateId);
      console.log(
        "Found that corresponding ForeignId" + senderCorrespondingForeignId
      );
    } catch (error) {
      console.log(error);
     // answer(false);
    }
    if (senderCorrespondingForeignId == data.senderForeignId) {
      try {
        console.log("User ist berechtigt einen KeyExchange zu starten.");

        if (isOnline(data.receiverForeignId)) {
          console.log("the current Exchange Partner is online");
          var socketId = getSocketId(data.receiverForeignId);
          var onlineKeyExchangeObject = {
            requesterForeignId: data.senderForeignId,
            requesterPublicKey: data.senderPublicKey,
          };
          //Hier doppelt checken ob der Initjator noch online ist
          socket.broadcast.to(socketId).emit("request-key-response", onlineKeyExchangeObject/*, async function (error, response) {
                //Keine Antwort wird hier erwartet
              }*/
            );
          //If Receiver IS online, then answer with true, which is interpreted as an 5 sec timer to ask again if
         
        } else {
          const keyExchangeObject = {
            senderPrivateId: data.senderPrivateId,
            senderForeignId: data.senderForeignId,
            receiverForeignId: data.receiverForeignId,
            senderPublicKey: data.senderPublicKey,
            timestamp: data.timestamp,
            status: "initiated",
            //status2 = answered
          };
          await mongodb.saveInitiateKeyExchange(keyExchangeObject);
          console.log("Key ExchangeObject Added to DB");
          
        }
      } catch (error) {
        console.log(error);
        
      }
    } else {
      console.log("User ist nicht berechtigt einen KeyExchange zu starten.");
     // answer(false);
    }
  });

  socket.on("online-key-response", async function (data, answer) {
    console.log("Server.Js online-key-response");
    try {
      var senderCorrespondingForeignId =
        await mongodb.findUserPermanentForeignId(data.responderPrivateId);
      console.log(
        "Found that corresponding ForeignId" + senderCorrespondingForeignId
      );
      if (senderCorrespondingForeignId == data.responderForeignId) {
        console.log("User ist berechtigt eine KeyResponse zu senden.");
        if (isOnline(data.requesterForeignId)) {
          //Sende object zurück
          var socketID = getSocketId(data.requesterForeignId);
          finalKeyObject = {
            responderId: data.responderForeignId,
            keyResponse: data.responderPublicKey,
          };
          socket.broadcast.to(socketID).emit("send-key-response", finalKeyObject/*,async function (error, response) {}*/);
        } else {
          console.log("Nicht Online Muss abgespeichert werden");
          var permanentIdOfRequester = await mongodb.findUserPermanentId(
            data.requesterForeignId
          );
          const keyExchangeObject = {
            senderPrivateId: permanentIdOfRequester,
            senderForeignId: data.requesterForeignId,
            receiverForeignId: data.responderForeignId,
            senderPublicKey: data.responderPublicKey,
            //timestamp: data.timestamp,
            //Bitte noch mitschicken
            status: "answered",
          };


          await mongodb.saveInitiateKeyExchange(keyExchangeObject);
          console.log("Key ExchangeObject Added to DB");
         // answer(true);
        }
      } else {
        console.log("User ist nicht berechtigt eine KeyResponse zu senden!");
       // answer(false);
      }
    } catch (error) {
      console.log(error);
     // answer(false);
    }
  });

  socket.on("check-for-key-requests", async function (data, answer) {
    console.log("server.js check-for-key-requests");
    try {
      var senderCorrespondingForeignId =await mongodb.findUserPermanentForeignId(data.privateId);
      console.log(
        "Found that corresponding ForeignId" + senderCorrespondingForeignId
      );
      if (senderCorrespondingForeignId == data.foreignId) {
        console.log("User ist berechtigt eine KeyExchanges abzufragen.");
        //Einmal abfragen ob Answered Objects da sind.
        console.log("Abfragen ob answered Objekte da sind.")
        var responses = await mongodb.searchForAnsweredExchanges(data.privateId,data.foreignId)
        console.log(responses)
        if(responses.length != 0){
          listOfResponses = []
          for(var i =0; i<responses.length;i++){
            listOfResponses.push({
              responderId:responses[i].receiverForeignId,
              keyResponse:responses[i].senderPublicKey
            });
          }
          var socketId = getSocketId(senderCorrespondingForeignId)
          io.to(socketId).emit("send-key-response", listOfResponses /*,async function (error, response) {}
            //Eig geht hier ja auch response???
          */);
        }else{
          console.log("No Answered Objects for HIM.")
        }
        //Einmal abfragen ob Initiated Objects da sind.
        console.log("Abfragen ob Initiated Objekte da sind.")
        var initiaedObjects = await mongodb.searchForInitiatedExchanges(data.foreignId)
        console.log(initiaedObjects)
        if(initiaedObjects.length != 0){
          listOfInitiatedObjects = []
          for(var i =0; i<initiaedObjects.length;i++){
            listOfInitiatedObjects.push({       
                mongodDbObjectId: initiaedObjects[i]._id,
                requesterForeignId: initiaedObjects[i].senderForeignId,
                requesterPublicKey: initiaedObjects[i].senderPublicKey,
            });
          }
          var socketId = getSocketId(senderCorrespondingForeignId)
          io.to(socketId).emit("request-key-response", listOfInitiatedObjects /*,async function (error, response) {}
            //Eig geht hier ja auch response???
          */);
        } else{
          console.log("No Initiated Objects for HIM.")
        }
      } else{
        console.log("User ist nicht berechtigt eine KeyExchanges abzufragen.");
        //answer(false)
      }
    } catch (error) {
      console.log(error)
     // answer(false)
    }
  });


  socket.on("initiated-key-received", async(data,answer)=>{
    //Auth muss noch  eingebaut werden.
    console.log("Server.js initiated-key-received")
    console.log(data)
    console.log(data.keyID)
    try {
      await mongodb.deleteKeyExchange(data.keyId)
      answer(true)
    } catch (error) {
      console.log(error)
      console.log("KeyExchange konnte nicht gelöscht werden.")
      answer(false)
    }

  })



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

function createServer(){
app.use(router);
app.use(cors());
server.listen(PORT, () => {console.log('Express server listening on port ' + PORT) })
}