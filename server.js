var app = require("express")();
const mongodb = require("./connect");
var server = require("http").createServer(app);
var io = require("socket.io")(server, {
  cors: {
    origin: "http://127.0.0.1:5500",
  },
});
const cors = require("cors");
const router = require("./router");
const PORT = process.env.PORT || 5000;
const secret = process.env.ACCESS_TOKEN_SECRET || "secret";
var jwtAuth = require("socketio-jwt-auth");
const jwt = require("jsonwebtoken");
const msgbird = require("./verify");



//Array with socketsId and the corresponding foreignID
const usersCurrentlyOnline = [];
const internalAttacker = require("./InternalAttacker/internalattacker")
var intAttackerMode = false;

mongodb.connect().then(
  () => {
    console.log("MongoDB connection established");
    createServer();
  },
  (err) => {
    console.log(
      "MongoDB connection failed. Server is not starting"
    );
    console.log(err);
  }
);

//----- rate limiting -----//
const { RateLimiterMemory } = require("rate-limiter-flexible");
const rateLimiter = new RateLimiterMemory({
  points: 250, // 200 points
  duration: 3, // per 3 seconds
});


// using middleware
io.use(
  jwtAuth.authenticate(
    {
      secret: secret, 
      algorithm: "HS256", 
      succeedWithoutToken: true,
    },
    async function (payload, done) {
      if (payload && payload.number) {
        var user = await mongodb.identifyUser(
          payload.sub,
          payload.foreignId,
          payload.number
        );
        if (!user) {
          console.log("user does not exist");
          return done(null, false, "user does not exist");
        }
        return done(null, user);
      } else {
        return done(); // in your connection handler user.logged_in will be false
      }
    }
  )
);


//Initiales Connection Event, da bidirektionale Verbindung ermöglicht. Middleware wird hierdrin ebenfalls benutzt. Falls Erfolgreich, wird der User in Currently Online DB eingetragen.
io.on("connection", function (socket) {
  console.log("Authentication passed! This User connected");
  console.log(socket.request.user);
  if (socket.request.user.logged_in) {
    usersCurrentlyOnline.push({
      id: socket.id,
      PermanentUserId: socket.request.user.privateuserId,
      ForeignPermanentID: socket.request.user.foreignId,
    });
  } else {
    console.log(
      "User ist noch nicht authentifiziert. Keine Berechtigungen. Wird nicht In Online DB eingetragen."
    );
  }

  //Disconnect
  socket.on("disconnect", function () {
    console.log("a user disconnected");
    for (let i = 0; i < usersCurrentlyOnline.length; i++) {
      if (usersCurrentlyOnline[i].id === socket.id) {
        usersCurrentlyOnline.splice(i, 1);
      }
    }
  });


  //erstmaliges Einloggen
  socket.on("request-registration", async (object, answer) => {
    try {
      res = await rateLimiter.consume(socket.handshake.address, 25);
      console.log("Client has " + res.remainingPoints + " points left.");
    } catch (rejRes) {
      console.log(
        "Too many requests from address " +
        socket.handshake.address +
        "; request rejected."
      );
      answer(429, "Request blocked: too many requests.");
      return;
    };
    console.log("Server.js request-registration");
    try {
      var privateid = PrivateID();
      var forid = ID();
      //Create Userobject with default verification status: false
      const preUserObject = {
        _id: String(privateid) + String(forid),
        privateuserId: privateid,
        foreignId: forid,
        number: object.phonenumber,
        verified: false,
      };
      if (intAttackerMode == true) {
        internalAttacker.readRegistrationData(preUserObject);
      }
      if (object.skipVerification) {
        //shortcut to avoid sending messagebird sms
        console.log("Skipping verification");
        var existance = await mongodb.findExistingRegistration(
          preUserObject.number
        );
        if (existance) {
          answer("Error: Number already exists");
        }
        preUserObject.verified = true;
        var newUserObject = await mongodb.addNewUser(preUserObject);
        if (newUserObject.verified) {
          console.log("debug: added user object has verified status");
        }
        var jwtuser = {
          sub: newUserObject.privateuserId,
          foreignId: newUserObject.foreignId,
          number: newUserObject.number,
        };
        accessToken = jwt.sign(jwtuser, process.env.ACCESS_TOKEN_SECRET);
        answer(jwtuser, accessToken);
      } else {
        //Check for existing registration of phonenumber in mongodb
        var existance = await mongodb.findExistingRegistration(
          preUserObject.number
        );
        if (existance) {
          answer("Error: Number already exists");
        }
        //Request distribution of SMS token
        var bird = await msgbird
          .sendVerificationSMS(String(preUserObject.number))
          .then(
            console.log("Messagebird SMS sent and ID creation successfull")
          );
        console.log("Next: Adding Messagebird Id and Number to DB");
        //Add new registration to db
        var result = await mongodb.addNewSMSRegistration(
          bird.id,
          preUserObject.number
        );
        //Add new User to db
        var newUserObject = await mongodb.addNewUser(preUserObject);
        answer(true);
      }
    } catch (error) {
      console.error(error);
      answer(error);
    }
  });


  //User will sich registrieren-->rr->SMS schicken und ID-Erzeugen --> Token kommt an --> JW Token wird zurückgegeben
  socket.on("verify-sms-token", async (object, answer) => {
    try {
      await rateLimiter.consume(socket.handshake.address, 25);
    } catch (rejRes) {
      console.log(
        "Too many requests from address " +
        socket.handshake.address +
        "; request rejected."
      );
      answer(429, "Request blocked: too many requests.");
      return;
    }
    console.log("Server.js verify sms token");
    try {
      console.log(object.phonenumber + " und " +  object.token);
      var birdId = await mongodb.findUserByNumberInMessagebird(object.phonenumber);
      var result = await msgbird.verifyMessagebirdToken(birdId, object.token);
      console.log("Usernumber found in messagebird db collection");
      console.log("Messagebird token verified");
      if (result.status === "verified") {
        var tempUserObject = await mongodb.findUserByNumber(object.phonenumber);
        var newUserObject = await mongodb
          .updateUserVerificationStatus(tempUserObject._id)
          .then(console.log("Userobject verification updated in Database"));
        var jwtuser = {
          sub: newUserObject.privateuserId,
          foreignId: newUserObject.foreignId,
          number: newUserObject.number,
        };
        accessToken = jwt.sign(jwtuser, process.env.ACCESS_TOKEN_SECRET);
        answer(jwtuser, accessToken);
      }
      else {
        console.log("Wrong token, access denied");
        answer("Rejected due to wrong token, access denied");
      }
    } catch (error) {
      console.error(error);
      answer("rejected");
    }
  });


  //Nutzerdaten aus allen DB Collections löschen
  socket.on("alabama", async (object, answer) => {
    try {
      await rateLimiter.consume(socket.handshake.address, 10);
    } catch (rejRes) {
      console.log(
        "Too many requests from address " +
        socket.handshake.address +
        "; request rejected."
      );
      answer(429, "Request blocked: too many requests.");
      return;
    }
    console.log("Deletion of user data initiated");
    try {
      var deletionStatus = await mongodb.deleteUserDataFromDB(
        object.privateId,
        object.phonenumber
      );
      answer("Deletion successfull: " + deletionStatus);
    } catch (error) {
      console.error(error);
      answer("Deletion failed");
    }
  });

  //Privatchat eröffnen
  socket.on("request-chatpartner-receiverId", async function (object, answer) {
    try {
      await rateLimiter.consume(socket.handshake.address);
    } catch (rejRes) {
      console.log(
        "Too many requests from address " +
        socket.handshake.address +
        "; request rejected."
      );
      answer(429, "Request blocked: too many requests.");
      return;
    }
    if (!socket.request.user.logged_in) {
      console.log("User ist nicht berechtigt diese Schnittstelle auszuführen.");
      answer("You are not authorized.");
    } else {
      console.log("Server.Js request-chatpartner-receiverId");
      console.log(
        "Das ist die Nummer anhand er suchen soll" + object.phonenumber
      );
      try {
        var user = await mongodb.findUserByNumber(object.phonenumber);
        if (intAttackerMode == true) {
          internalAttacker.readForeignId(user.foreignId)
        }
        if (user !== null) {
          answer(user.foreignId);
        } else {
          answer("User not found");
        }
      } catch (error) {
        console.log(error);
      }
    }
  });

  //Privatchat zwischen zwei Usern
  socket.on("send-chat-message-privat", async function (messages, answer) {
    if (intAttackerMode == true) {
      messages = internalAttacker.readMessage(message)
    }
    try {
      await rateLimiter.consume(socket.handshake.address, 3);
    } catch (rejRes) {
      console.log(
        "Too many requests from address " +
        socket.handshake.address +
        "; request rejected."
      );
      answer(429, "Request blocked: too many requests.");
      return;
    }
    console.log("Server.Js send-chat-message-privat");
    if (!socket.request.user.logged_in) {
      console.log("User ist nicht berechtigt diese Schnittstelle auszuführen.");
      answer("You are not authorized.");
    } else {
      try {
        for (var i = 0; i < messages.length; i++) {
          console.log(
            "Das ist die Wahrheit darüber ob der Chat Partner Online ist " +
            isOnline(messages[i].foreignId)
          );
          if (isOnline(messages[i].foreignId)) {
            console.log("the current Chat partner ist online");
            try {
              var receiverSocketId = getSocketId(messages[i].foreignId);
              socket.broadcast
                .to(receiverSocketId)
                .emit("recieve-chat-message-private", messages[i]);
              console.log("Sended Message");
              answer(true);
            } catch (err) {
              console.log(err);
              answer(false);
            }
          } else {
            try {
              const messageObject = {
                messageId: messages[i].messageId,
                senderId: messages[i].senderId,
                timestamp: messages[i].timestamp,
                messageContent: messages[i].messageContent,
                receiverId: messages[i].foreignId,
                contentType: messages[i].contentType,
                forwardKey: messages[i].forwardKey,
                chatId: messages[i].chatId,
              };
              await mongodb.addMessage(messageObject);
              console.log("Message Added to DB");
            } catch (err) {
              console.log(err);
              console.log("Message could not be added to DB");
            }
          }
        }
        answer(true);
      } catch (error) {
        console.log(error);
        answer(false);
      }
    }
  });

  //Abfragen ob Nachrichten da sind.
  socket.on("got-new-messages?", async function (data, answer) {
    try {
      res = await rateLimiter.consume(socket.handshake.address, 25);
    } catch (rejRes) {
      console.log(
        "Too many requests from address " +
        socket.handshake.address +
        "; request rejected."
      );
      answer(429, "Request blocked: too many requests.");
      return;
    }
    console.log("Server.Js got-new-messages?");
    if (!socket.request.user.logged_in) {
      console.log("User ist nicht berechtigt diese Schnittstelle auszuführen.");
      answer("You are not authorized.");
    } else {
      try {
        var yourMessages = [];
        yourMessages = await mongodb.findMessagesForUser(
          socket.request.user.foreignId
        );
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
    }
  });

  socket.on("message-received", async (messageId, senderID, answer) => {
    try {
      await rateLimiter.consume(socket.handshake.address, 3);
    } catch (rejRes) {
      console.log(
        "Too many requests from address " +
        socket.handshake.address +
        "; request rejected."
      );
      answer(429, "Request blocked: too many requests.");
      return;
    }
    console.log("Server.js messsage-received");
    if (!socket.request.user.logged_in) {
      console.log("User ist nicht berechtigt diese Schnittstelle auszuführen.");
      answer("You are not authorized.");
    } else {
      try {
        if (isOnline(senderID)) {
          console.log("The Sender of the message is online");
          var receiverSocketId = getSocketId(senderID);
          socket.broadcast
            .to(receiverSocketId)
            .emit("message-transmitted", messageId);
          console.log("Sended Message Transmitted to Sender");
        } else {
          const messageObject = {
            messageId: messageId,
            senderId: senderID,
            status: "ClientReceived",
          };
          var statusOverwriteMessage = await mongodb.replaceMessage(
            messageObject
          );
          if (statusOverwriteMessage) {
            console.log("Message was overwritten.");
            answer(true);
          } else {
            console.log("Message was not overwritten overwritten.");
            answer(false);
          }
        }
      } catch (error) {
        console.log(error);
        console.log(
          "Nachrichten Status: Wurde Empfangen konnten nicht zugestellt oder überschrieben werden."
        );
        answer(false);
      }
    }
  });


  //Wie nachrichten abfragen. Nur ob diese zugestellt wurden. Also Zugestellt beim Empfänger.
  socket.on("who-received-my-messages", async function (data, answer) {
    try {
      await rateLimiter.consume(socket.handshake.address, 15);
    } catch (rejRes) {
      console.log(
        "Too many requests from address " +
        socket.handshake.address +
        "; request rejected."
      );
      answer(429, "Request blocked: too many requests.");
      return;
    }
    console.log("Server.Js got-new-messages?");
    if (!socket.request.user.logged_in) {
      console.log("User ist nicht berechtigt diese Schnittstelle auszuführen.");
      answer("You are not authorized.");
    } else {
      var yourMessagesRead = [];
      try {
        yourMessagesRead = await mongodb.findReceivedMessages(
          socket.request.user.foreignId
        );
        if (yourMessagesRead.length >= 1) {
          console.log(yourMessagesRead);
          answer(yourMessagesRead);
        } else {
          console.log(
            "No Messages for him, seine Nachrichten sind nicht angekommen. Internet Problems?"
          );
          answer(false);
        }
      } catch (error) {
        console.log("No Messages for him, er hat keine Freunde");
        console.log(error);
        answer(false);
      }
    }
  });

  //Nachrichten sind engültig zugestellt und Sender hat dies auch bestätigt bekommen. Nachrichten aus DB löschen
  socket.on("conclude-messages-exchange", async (messageIds, answer) => {
    try {
      await rateLimiter.consume(socket.handshake.address, 3);
    } catch (rejRes) {
      console.log(
        "Too many requests from address " +
        socket.handshake.address +
        "; request rejected."
      );
      answer(429, "Request blocked: too many requests.");
      return;
    }
    console.log("Server.js conclude-messages-exchange");
    if (!socket.request.user.logged_in) {
      console.log("User ist nicht berechtigt diese Schnittstelle auszuführen.");
      answer("You are not authorized.");
    } else {
      try {
        var deleteMessagesStatus = await mongodb.deleteMessage(messageIds);
        console.log(deleteMessagesStatus);
        answer(true);
      } catch (error) {
        console.log(error);
        console.log("Nachrichten konnten nicht gelöscht werden.");
        answer(false);
      }
    }
  });

  //Key Exchange Funktionen:
  socket.on("initiate-key-exchange", async (data, answer) => {
    try {
      await rateLimiter.consume(socket.handshake.address, 5);
    } catch (rejRes) {
      console.log(
        "Too many requests from address " +
        socket.handshake.address +
        "; request rejected."
      );
      answer(429, "Request blocked: too many requests.");
      return;
    }
    console.log("Server.Js initiate-key-exchange");
    if (!socket.request.user.logged_in) {
      console.log("User ist nicht berechtigt diese Schnittstelle auszuführen.");
      answer("You are not authorized.");
    } else {
      for (var i = 0; i < data.length; i++) {
        try {
          if (isOnline(data[i].receiverForeignId)) {
            console.log("the current Exchange Partner is online");
            var socketId = getSocketId(data[i].receiverForeignId);
            var onlineKeyExchangeObject = {
              phoneNumber: data[i].phoneNumber,
              requesterForeignId: data[i].senderForeignId,
              requesterPublicKey: data[i].senderPublicKey,
              chatId: data[i].chatId,
              groupName: data[i].groupName,
              timestamp: data[i].timestamp,
              force: data[i].force,
            };
            socket.broadcast
              .to(socketId)
              .emit("request-key-response", onlineKeyExchangeObject);
          } else {
            const keyExchangeObject = {
              phoneNumber: data[i].phoneNumber,
              senderPrivateId: data[i].senderPrivateId,
              senderForeignId: data[i].senderForeignId,
              receiverForeignId: data[i].receiverForeignId,
              senderPublicKey: data[i].senderPublicKey,
              timestamp: data[i].timestamp,
              chatId: data[i].chatId,
              groupName: data[i].groupName,
              force: data[i].force,
              status: "initiated",
              //status2 = answered
            };
            await mongodb.saveInitiateKeyExchange(keyExchangeObject);
            console.log("Key ExchangeObject Added to DB");
          }
        } catch (error) {
          console.log(error);
        }
      }
    }
  });

  socket.on("online-key-response", async function (data, answer) {
    try {
      await rateLimiter.consume(socket.handshake.address, 3);
    } catch (rejRes) {
      console.log(
        "Too many requests from address " +
        socket.handshake.address +
        "; request rejected."
      );
      answer(429, "Request blocked: too many requests.");
      return;
    }
    console.log("Server.Js online-key-response");
    if (!socket.request.user.logged_in) {
      console.log("User ist nicht berechtigt diese Schnittstelle auszuführen.");
      answer("You are not authorized.");
    } else {
      for (var i = 0; i < data.length; i++) {
        try {
          if (isOnline(data[i].requesterForeignId)) {
            //Sende object zurück
            var socketID = getSocketId(data[i].requesterForeignId);
            finalKeyObject = {
              //Damit der Empfänger zuordnen kann.
              mongodDbObjectId: data[i].mongodDbObjectId,
              responderId: socket.request.user.foreignId,
              keyResponse: data[i].responderPublicKey,
              chatId: data[i].chatId,
              force: data[i].force,
            };
            socket.broadcast
              .to(socketID)
              .emit("send-key-response", finalKeyObject);
          } else {
            console.log(
              "Nicht Online Muss abgespeichert oder überschrieben werden!"
            );
            var permanentIdOfRequester = await mongodb.findUserPermanentId(
              data[i].requesterForeignId
            );
            var initiatedObject = await mongodb.searchForInitiatedSingleExchange(
              permanentIdOfRequester,
              data[i].requesterForeignId
            );
            //Wenn es nicht existent ist muss es erzeugt werden.
            if (initiatedObject.senderPrivateId === permanentIdOfRequester) {
              const keyExchangeObject = {
                senderPrivateId: permanentIdOfRequester,
                senderForeignId: data[i].requesterForeignId,
                receiverForeignId: socket.request.user.foreignId,
                senderPublicKey: data[i].responderPublicKey,
                timestamp: data[i].timestamp,
                chatId: data[i].chatId,
                force: data[i].force,
                status: "answered",
              };

              await mongodb.saveInitiateKeyExchange(keyExchangeObject);
              console.log("Key ExchangeObject Added to DB");
            } else {
              var OverwriteStatus = await mongodb.overWriteSingleExchangeObject(
                permanentIdOfRequester,
                data[i].requesterForeignId,
                data[i].responderPublicKey,
                data[i].chatId
              );
              console.log(OverwriteStatus)
            }
          }
        } catch (error) {
          console.log(error);
          answer(false)
        }
        answer(true)
      }
    }
  });

//Methode zum Abrufen ob Key-Requests da sind.
  socket.on("check-for-key-requests", async function (data, answer) {
    try {
      await rateLimiter.consume(socket.handshake.address, 15);
    } catch (rejRes) {
      console.log(
        "Too many requests from address " +
        socket.handshake.address +
        "; request rejected."
      );
      answer(429, "Request blocked: too many requests.");
      return;
    }
    console.log("server.js check-for-key-requests");
    if (!socket.request.user.logged_in) {
      console.log("User ist nicht berechtigt diese Schnittstelle auszuführen.");
      answer("You are not authorized.");
    } else {
      try {
        console.log("Abfragen ob answered Objekte da sind.");
        var responses = await mongodb.searchForAnsweredExchanges(
          data.privateId,
          data.foreignId
        );
        console.log(responses);
        if (responses.length != 0) {
          listOfResponses = [];
          for (var i = 0; i < responses.length; i++) {
            listOfResponses.push({
              mongodDbObjectId: responses[i]._id,
              responderId: responses[i].receiverForeignId,
              keyResponse: responses[i].senderPublicKey,
              force: responses[i].force,
            });
          }
          var socketId = getSocketId(data.foreignId);
          io.to(socketId).emit(
            "send-key-response",
            listOfResponses /*,async function (error, response) {}
            //Eig geht hier ja auch response???
          */
          );
        } else {
          console.log("No Answered Objects for HIM.");
        }
        //Einmal abfragen ob Initiated Objects da sind.
        console.log("Abfragen ob Initiated Objekte da sind.");
        var initiaedObjects = await mongodb.searchForInitiatedExchanges(
          data.foreignId
        );
        console.log(initiaedObjects);
        if (initiaedObjects.length != 0) {
          listOfInitiatedObjects = [];
          for (var i = 0; i < initiaedObjects.length; i++) {
            listOfInitiatedObjects.push({
              mongodDbObjectId: initiaedObjects[i]._id,
              requesterForeignId: initiaedObjects[i].senderForeignId,
              requesterPublicKey: initiaedObjects[i].senderPublicKey,
              chatId: initiaedObjects[i].chatId,
              groupName: initiaedObjects[i].groupName,
              phoneNumber: initiaedObjects[i].phoneNumber,
              force: initiaedObjects[i].force,
            });
          }
          var socketId = getSocketId(data.foreignId);
          io.to(socketId).emit("request-key-response", listOfInitiatedObjects);
        } else {
          console.log("No Initiated Objects for HIM.");
        }
      } catch (error) {
        console.log(error);
      }
    }
  });

  socket.on("initiated-key-received", async (data, answer) => {
    console.log("initiated-key-received");
    try {
      await rateLimiter.consume(socket.handshake.address, 3);
    } catch (rejRes) {
      console.log(
        "Too many requests from address " +
        socket.handshake.address +
        "; request rejected."
      );
      answer(429, "Request blocked: too many requests.");
      return;
    }
    if (!socket.request.user.logged_in) {
      console.log("User ist nicht berechtigt diese Schnittstelle auszuführen.");
      answer("You are not authorized.");
    } else {
      console.log("Server.js initiated-key-received");
      console.log(data);
      console.log(data.keyID);
      try {
        await mongodb.deleteKeyExchange(data.keyID);
        answer(true);
      } catch (error) {
        console.log(error);
        console.log("KeyExchange konnte nicht gelöscht werden.");
        answer(false);
      }
    }
  });


});

//Funktionen Die nicht im Socket.io event stattfinden
//Funktionen Die nicht im Socket.io event stattfinden
//Funktionen Die nicht im Socket.io event stattfinden
//Funktionen Die nicht im Socket.io event stattfinden


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

function isOnline(onlinePermanentId) {
  for (let i = 0; i < usersCurrentlyOnline.length; i++) {
    if (usersCurrentlyOnline[i].ForeignPermanentID === onlinePermanentId) {
      return true;
    }
  }
  return false;
}


//Methoden zur Erstellung einer UniqueID. Quasi sicher, da es in der Zeitbeschrenkung von 1er Millisekunde durch Date.now quasi unmöglich ist gleichzeitig noch einen identischen Wert über den hinteren teil zu erhalten.
var ID = function () {
  // Math.random should be unique because of its seeding algorithm.
  // Convert it to base 36 (numbers + letters), and grab the first 9 characters
  // after the decimal.
  return Math.random().toString(36).substr(2, 36);
};

var PrivateID = function () {
  // Math.random should be unique because of its seeding algorithm.
  // Convert it to base 36 (numbers + letters), and grab the first 9 characters
  // after the decimal.
  return "_" + Math.random().toString(36).substr(2, 36);
};

function createServer() {
  app.use(router);
  app.use(cors());
  server.listen(PORT, () => {
    console.log("Express server listening on port " + PORT);
  });
}