var app = require("express")();
var server = require("http").createServer(app);
var io = require("socket.io")(server,{
  cors: {
    origin: "http://127.0.0.1:5500"
  }});
const cors = require("cors");
const router = require("./router");
const PORT = process.env.PORT || 5000;
const mongodb = require("./connect");
const messagebird = require("messagebird")(process.env.MSGBIRD_TEST_ACCESS_KEY);
const secret = process.env.SECRET || 'secret';


//Array with socketsId and the corresponding foreignID
const usersCurrentlyOnline = [];
mongodb.connect().then(
  () => {
    console.log("Connection zu MongoDB ist aufgebaut");
    createServer();
  },
  (err) => {
    console.log(
      "Keine Connection Zu MongoDB Möglich. Server wird nicht gestartet"
    );
    console.log(err);
  }
);

// set authorization for socket.io
var jwtAuth = require('socketio-jwt-auth');
// using middleware
io.use(jwtAuth.authenticate({
  secret: 'secret',    // required, used to verify the token's signature
  algorithm: 'HS256',        // optional, default to be HS256
  //succeedWithoutToken: true
}, async function(payload, done) {
  // you done callback will not include any payload data now
  // if no token was supplied
  if (payload && payload.number) {
    console.log(payload.number)
   var user  = await mongodb.identifyUser(payload.sub,payload.foreignId,payload.number)
      console.log("Das ist die user Variable" + user)
      if (!user) {
        // return fail with an error message
        console.log("User existiert nicht")
        return done(null, false, 'user does not exist');
      }
      // return success with a user info
      return done(null, user);
    
  } else {
    return done() // in your connection handler user.logged_in will be false
  }
}));

io.on('connection', function(socket) {
  console.log('Authentication passed!');
  // now you can access user info through socket.request.user
  // socket.request.user.logged_in will be set to true if the user was authenticated
  socket.emit('success', {
    message: 'success logged in!',
    user: socket.request.user
  });
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
  return Math.random().toString(36).substr(2, 9);
};

var PrivateID = function () {
  // Math.random should be unique because of its seeding algorithm.
  // Convert it to base 36 (numbers + letters), and grab the first 9 characters
  // after the decimal.
  return "_" + Math.random().toString(36).substr(2, 9);
};

//This Part has to be at the bottom of the Code

function createServer() {
  app.use(router);
  app.use(cors());
  server.listen(PORT, () => {
    console.log("Express server listening on port " + PORT);
  });
}
