var app = require("express")();
var server = require("https").createServer(app);
var io = require("socket.io")(server);
const cors = require("cors");
const router = require("./router");
const PORT = process.env.PORT || 5000;
const mongodb = require("./connect");

const User = require("./models/user.model");
const { resolve } = require("path");
const { rejects } = require("assert");

//array with socketsId and the corresponding permanentID
const usersCurrentlyOnline = [];

io.on("connection", function (socket) {
  console.log("a user connected");
  var connectionStatus = mongodb.connect();
  console.log(connectionStatus);

  //Disconnect
  socket.on("disconnect", function () {
    console.log("user disconnected");
    for (let i = 0; i < usersCurrentlyOnline.length; i++) {
      if (usersCurrentlyOnline[i].id === socket.id) {
        usersCurrentlyOnline.splice(i, 1);
      }
    }
  });

  //Re-Einloggen in das Netzwerk, trägt User in Currently Online DB ein
  socket.on("send-user-id", (arg1, arg2, answer) => {
    console.log(arg1);
    usersCurrentlyOnline.push({
      id: socket.id,
      PermanentUserID: arg1,
      ForeignPermanentID: arg2,
    });

    answer(true);
  });

  //erstmaliges Einloggen
  socket.on("request-registration", async (object, answer) => {
    try {
      var privateid = ID();
      var forid = ID();
      const preUserObject = {
        privateuserId: privateid,
        foreignId: forid,
        number: object.phonenumber,
        // spitzname: "Beispielspitzname",
      };
      var abspeichernStatus = await mongodb.addNewUser(preUserObject);
      console.log(abspeichernStatus);
      console.log("Ausgabe des Users");
      console.log(preUserObject);
      console.log("createdUser");
      answer(preUserObject);
    } catch (error) {
      console.error(error);
      answer(false);
    }
  });

  socket.on("test", async function (object, answer) {
    currentForeignId = object.foreignId;
    console.log(
      "das ist die ReceiverID falls er Online ist" + currentForeignId
    );
    var matchingPer = await mongodb.findUserPermanentId(someNumber);
    var machtingPermanentId = await mongodb.findUserByNumber(someNumber);
    var is = await mongodb.findMessagesForUser(skakas);
  });

  //Privatchat eröffnen
  socket.on("request-chatpartner-receiverId", async function (object, answer) {
    currentPhoneNumber = object.phonenumber;
    console.log(
      "Das ist die Nummer anhand er suchen soll" + currentPhoneNumber
    );
    var user = await mongodb.findUserByNumber(currentPhoneNumber);
    console.log(user.foreignId);
    answer(user.foreignId);
  });

  //Privatchat zwischen zwei Usern
  socket.on("send-chat-message-privat", async function (message, answer) {
    console.log("das ist die ReceiverID" + message.foreignId);
    console.log("das sind alle User die online sind");
    console.log(
      "Das ist die Wahrheit darüber ob der Chat Partner Online ist " +
        isOnline(message.foreignId)
    );
    if (isOnline(message.foreignId)) {
      console.log("the current Chat partner ist online");
      try {
        var receiverSocketId = getSocketId(message.foreignId);
        console.log("Dort Senden wir hin:" + receiverSocketId);
        socket.broadcast
          .to(receiverSocketId)
          .emit("recieve-chat-message-private", message);
        console.log("Sended Message");
        answer(true);
      } catch (err) {
        console.log(err);
        console.log("hat nicht geklappt");
        answer(false);
      }
    } else {
      try {
        var response = await mongodb.findUserPermanentId(message.foreignId);
        const messageObject = {
          messageId: message.messageId,
          creatorId: message.senderId,
          timestamp: message.timestamp,
          Message: message.messageContent,
          receiverId: response.privateuserId,
        };
        await mongodb.addMessage(messageObject);
      } catch (err) {
        console.log(err);
        console.log("message could not be added to DB");
      }
    }
  });

  socket.on("got-new-messages?", async function (data, answer) {
    try {
      var yourMessages = [];
      yourMessages = await mongodb.findMessagesForUser(data.myprivateId);
      if (yourMessages.length >= 1) {
        console.log(yourMessages);
        answer(yourMessages);
      } else {
        answer("No Messages For you, du hast keine Freunde");
      }
    } catch (error) {
      console.log(error);
      answer(false);
    }
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
