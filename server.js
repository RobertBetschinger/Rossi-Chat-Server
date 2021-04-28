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
  socket.on("send-user-id", (arg1, answer) => {
    console.log(arg1);
    usersCurrentlyOnline.push({
      id: socket.id,
      PermanentUserID: arg1,
    });
  });

  //erstmaliges Einloggen
  socket.on("request-registration", (object, answer) => {
    try {
      var id = ID();
      const preUserObject = {
        userId: id,
        number: object.phonenumber,
        spitzname: "Das ist ein Kolibri",
      };
      console.log("Neue Methode und alte methode gemixed");
      var abspeichernStatus = mongodb.addNewUser(preUserObject);
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

  //Privatchat eröffnen
  //Hier die Variablen noch verbessern
  socket.on("request-chatpartner-receiverId", async function (object, answer) {
    currentPhoneNumber = object.phonenumber;
    var user = await mongodb.findUserByNumber(currentPhoneNumber);
    console.log(user.userId);
    answer(user.userId);
  });

  //Privatchat zwischen zwei Usern
  socket.on("send-chat-message-privat", async function (message, answer) {
    console.log("das ist die ReceiverID" + message.receiverId);
    console.log("das sind alle User die online sind");
    console.dir(usersCurrentlyOnline, { maxArrayLength: null });

    //Search Empfänger ID by Chat ID, momentan wird davon ausgegangen das die Empfänger ID mitgesendet wird
    //Funktion die alle Empfäner IDs aus
    //receiverID = Permanent ID of other User
    console.log(
      "Das istdie Wahrheut darüber ob der Chat Partner Online ist" +
        isOnline(message.receiverId)
    );
    if (isOnline(message.receiverId)) {
      console.log("the current Chat partner ist online");
      try {
        var receiverSocketId = getSocketId(message.receiverId);
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
      // Für Timo, In nicht zugestellte Nachrichten abspeichern.
      // await mongoDb.addMessage(message)
      // answer(false);    
    }
  });

//1. Nachrichten abspeichern die nicht zugestellt werden könnnen.
//2. Nachrichten abrufen können, wennn man dann weider online geht.
//   Dazum Muss die Funktion in Channel.JS geschrieben werden, FRAglich hierbei mit CHAT ID
//   Müssen wir die Chats, also die Gruppen abspeichern?



  socket.on("got-new-messages?", async function (data, answer)  {
    try {
      //Für Timo: Funktion die überprüft ob Nachrichten vorhanden sind für die permanent UserID
      //Mit Welcher ID soll überprüft werden ob chats da sind
      var yourMessages = []
      yourMessages = await mongoDb.findMessagesForUser();

      if (yourMessages.length >= 0) {
        answer(msglist);
      } else {
        answer("No Messages For you, du hast keine Freunde");
      }
    } catch {
      console.log(error);
      answer(false);
    }
  });
});

socket.on("change-phonenumber", (object, answer) => {
  //Für Timo: Datenbankanbindung
});

socket.on("change-pseudonym", (object, answer) => {
  //Für Timo: Datenbankanbindung
});

//
//Funktionen Die nicht im Socket.io event stattfinden
//

function lookUpChatPartners(chatId) {
  //Searches in ChatDatabase all Chat pArtners, returns array
}

function getSocketId(recevierId) {
  for (let i = 0; i < usersCurrentlyOnline.length; i++) {
    if (usersCurrentlyOnline[i].PermanentUserID === recevierId) {
      //Return Socket ID
      console.log(usersCurrentlyOnline[i].id);
      return usersCurrentlyOnline[i].id;
    }
  }
  return null;
}

function isOnline(onlinePermanentId) {
  for (let i = 0; i < usersCurrentlyOnline.length; i++) {
    if (usersCurrentlyOnline[i].PermanentUserID === onlinePermanentId) {
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
