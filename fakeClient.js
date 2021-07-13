//Das war ein FakeClient, welcher genutzt wurde um die JW-Tokens zu testen.
//Der FakeClient verbindet sich ohne Token und schickt eine Anfrage, welche jedoch nicht bearbeitet wird, da er kein Token mitliefert

console.log("Hello World")
const io = require("socket.io-client")

var socket = io("localhost:5000");

setTimeout(function(){console.log(socket)}, 3000);
socket.emit('test',"test");


