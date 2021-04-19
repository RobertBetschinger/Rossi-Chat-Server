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

        socket.on("request-registration", (data, answer) => {
            try {
              //const createdUser = await this.User.create(userInfo);
            
              console.log(data.phonenumber)
              console.log("createdUser")
              answer(true)
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



//This Part has to be at the bottom of the Code
app.use(router);
app.use(cors());
server.listen(PORT, () => console.log("Server has started on Port: " + PORT));