var app = require("express")();
var server = require("http").createServer(app);
var io = require("socket.io")(server);
const cors = require("cors");

const router = require("./router");
const PORT = process.env.PORT || 5000;

const usersCurrentlyOnline = [];

io.on("connection", function (socket) {
    console.log("a user connected");

    //Disconnect
    socket.on("disconnect", function () {
        console.log("user disconnected");
            for (let i = 0; i < users.length; i++) {
            if (users[i].id === socket.id) {   
                users.splice(i, 1);
            }
            }
           
        });

        socket.on("send-user-id",(arg1,answer) => {
            console.log(arg1)
            usersCurrentlyOnline.push({
                id: socket.id,
                PermanentUserID: arg1
              });
            //Funktion ADD User Currently Online
        });

        socket.on("request-registration", (arg1,object, answer) => {
            try {
              //Für Timo
              //Datenbank abspeichern mit nummer/Pseudonym und dazugehöriger ID 
              var id = ID()
                const UserObject={
                    userId: id,
                    number: object.phonenumber,
                    spitzname: object.pseudonym
                }
              console.log(UserObject)
             //const createdUser = await this.User.create(userInfo); Befehl zum abspeichern des Users in der Datenbank
                console.log("createdUser")
              const privMessageObj = {
                userId: id
              };
              console.log(privMessageObj)
              answer(privMessageObj)
          } catch (error) {
              console.error(error) 
              answer(false)
          }
          });


          //Ganz WICHTIG:
          //AddUserCurrentlyOnline List
          //AbfrageWerGeradeOnline ISt

          //Neue Funktionen
          //Change Pseudonym
          //OpenChat ID



    
         
          //Privatchat zwischen zwei Usern
          socket.on("send-chat-message-privat", (message,answer) => {
            console.log(message)

           //Search Empfänger ID by Chat ID
           //Look Up if he is currently Online
            var IsOnline = true 
           if(IsOnline){
               try{
                // socket.broadcast.to(empfänger.id).emit("recieve-chat-message-private",message)
                console.log("Sended Message") 
                answer(true)
               }catch{
                console.error(error) 
                answer(false)
               }
           } else{
               //Für Timo
               //Lege Nachricht in Speicher ab
           }
              
            
             
    
            });

            
      
      
          socket.on("got-new-messages?",(data, answer) => {
            //Probably dont need data
          });


        });



        var ID = function () {
            // Math.random should be unique because of its seeding algorithm.
            // Convert it to base 36 (numbers + letters), and grab the first 9 characters
            // after the decimal.
            return '_' + Math.random().toString(36).substr(2, 9);
          };



//This Part has to be at the bottom of the Code
app.use(router);
app.use(cors());
server.listen(PORT, () => console.log("Server has started on Port: " + PORT));