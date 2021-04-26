const express = require ("express");
const app = express();
const Port = process.env.Port || 3000;
const userController = require("./controllers/userController");

const mongodb = require("./connect");

app.listen(Port, ()=> {
    console.log("Express server started at port : 3000")
});

app.use("/user", userController);


const userObject ={
    userId: "Timo",
    phonenumber: "0815",
    pseudonym: "Dimmo"
};

const message={
    messageId: "2021",
    creatorId: "Dimmo",
    Message: ["Hi There"]
};

var connectionStatus = mongodb.connect();
console.log(connectionStatus);


//var userStatus = mongodb.addNewUser(userObject);
//console.log(userStatus);


//mongodb.addMessage(message);

//mongodb.findUser("Timo");

//mongodb.findMessage("2021");

//mongodb.deleteMessage("2021");
