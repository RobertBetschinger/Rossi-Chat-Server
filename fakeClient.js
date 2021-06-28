console.log("Hello World")
const io = require("socket.io-client")
//const socket = io("localhost:5000", );


var socket = io("localhost:5000");



setTimeout(function(){console.log(socket)}, 3000);
socket.emit('test',"test");


