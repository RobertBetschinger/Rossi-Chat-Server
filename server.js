        var app = require("express")();
        var server = require("http").createServer(app);
        var io = require("socket.io")(server);
        const cors = require("cors");

        const Datastore = require("nedb");
        iddb = new Datastore({ filename: "iddatabase", autoload: true }); //ID Database, Speicherung der Daten der User
        msgdb = new Datastore({ filename: "msgdatabase", autoload: true }); //Message Database, nicht zugestellte Nachrichten werden hier für permanentId und Message gespeichert
        chatsdb = new Datastore({filename: "chatsdatabase", autoload: true}) //Chats Database, Eine Datenbank mit den Chats und den jeweiligen Partnern, kene nachrichten
        const fs = require("fs");
        const dbmod = require("./db_module");
        const router = require("./router");
        const PORT = process.env.PORT || 5000;

        const usersCurrentlyOnline = [];

        io.on("connection", function (socket) {
          console.log("a user connected");

          //Disconnect
          socket.on("disconnect", function () {
            console.log("user disconnected");
            for (let i = 0; i < usersCurrentlyOnline.length; i++) {
              if (usersCurrentlyOnline[i].id === socket.id) {
                usersCurrentlyOnline.splice(i, 1);
              }
            }
          });

          socket.on("send-user-id", (arg1, answer) => {
            console.log(arg1);
            usersCurrentlyOnline.push({
              id: socket.id,
              PermanentUserID: arg1,
            });
          });

          socket.on("request-registration", (object, answer) => {
            try {
              var id = ID();
              const UserObject = {
                userId: id,
                number: object.phonenumber,
                spitzname: object.pseudonym,
              };
              //Abspeichern des neuen Nutzers in der ID-Database
                dbmod.addNewUser(UserObject);
              
              console.log(UserObject);
              console.log("createdUser");
              const privMessageObj = {
                userId: id,
              };
              console.log(privMessageObj);
              answer(privMessageObj);
            } catch (error) {
              console.error(error);
              answer(false);
            }
          });

          socket.on("datenbank-ausgeben", (answer)=>{
                try{
                  datenbankobject =Iddb.requestIddbcontent()
                  console.log(datenbankobject)
                  answer(datenbankobject)
                }catch(error){
                  console.error(error);
                  answer(false)
                }


          })

        

          socket.on("change-phonenumber", (object, answer)=>{
            //Für Timo: Datenbankanbindung
            iddb.changePhonenumber() //Übergabe userId und neue Nummer benötigt 
          })

          socket.on("change-pseudonym", (object, answer)=>{
            //Für Timo: Datenbankanbindung
            iddb.changeNickname() //Übergabe userId und neuer Nickname benötigt 
          })


          //Nur für Gruppenchat
          socket.on("open-new-Chat",(object,answer)=>{
            //Telefonnummer mit PermanentID in Datenbank abgleichen
          });


          //Privatchat eröffnen
          socket.on("request-chatpartner-receiverId",(object,answer)=>{
            try{

                answer()

            } catch{
              answer(false)
            }
          });


          //Privatchat zwischen zwei Usern
          socket.on("send-chat-message-privat", (message, answer) => {
            console.log(message);

            //Search Empfänger ID by Chat ID, momentan wird davon ausgegangen das die Empfänger ID mitgesendet wird
            //Funktion die alle Empfäner IDs aus
            //receiverID = Permanent ID of other User
            if (isOnline(message.receiverId)) {
              try {
                var receiverSocketId = getSocketId(message.receiverId);
                // socket.broadcast.to(receiverSocketId).emit("recieve-chat-message-private",message)
                console.log("Sended Message");
                answer(true);
              } catch {
                console.error(error);
                answer(false);
              }
            } else {
              //Für Timo
              //Lege Nachricht in MessageDatenbankSpeicher ab
              dbmod.addMessage(message)
            }
          });

          socket.on("got-new-messages?", (data, answer) => {
            try{
              //Für Timo: Funktion die überprüft ob Nachrichten vorhanden sind für die permanent UserID
              msglist = msgdb.requestMessagelist() //Übergabe userId
              if(msglist =! [])
                answer(msglist)
              else{
                answer("No Messages For you, du hast keine Freunde")
              }

            }catch{
              console.log(error)
              answer(false)
            }
          });
});

        function lookUpChatPartners(chatId){
          //Searches in ChatDatabase all Chat pArtners, returns array
        }


        function getSocketId(receiverId){
          for (let i = 0; i < usersCurrentlyOnline.length; i++) {
            if (usersCurrentlyOnline[i].PermanentUserID === receiverPermanentId) {
            return usersCurrentlyOnline.id;
        }
        return null
      }
    }

        function isOnline(onlinePermanentId){
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
