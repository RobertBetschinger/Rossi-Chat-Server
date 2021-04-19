var app = require("express")();
var server = require("http").createServer(app);
var io = require("socket.io")(server);
const cors = require("cors");

const router = require("./router");
const PORT = process.env.PORT || 5000;

const users = [];

io.on("connection", function (socket) {
    console.log("a user connected");

    //Disconnect
    socket.on("disconnect", function () {
        console.log("user disconnected");
        let disconnectedName;
            for (let i = 0; i < users.length; i++) {
            if (users[i].id === socket.id) {
                disconnectedName = users[i].userName;
                users.splice(i, 1);
            }
            }
            socket.broadcast.emit("Person Disconnected", disconnectedName);
        });

        socket.on("request-registration", (object, answer) => {
            try {
                //Für Timo
              //const createdUser = await this.User.create(userInfo);
              console.log(object)
              console.log(object.phonenumber)
              var id = object.phonenumber + ID()
              console.log(id)
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
        
      
         
          //Gruppenchat mit allen connecten Sockets/Usern
          socket.on("send-chat-message", (message) => {
              console.log(message.message)
              console.log(message.userName)
           
          
             // socket.broadcast.emit("chat-message", {
             //   message: message,
             //   name: userName.userName,
             // });
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