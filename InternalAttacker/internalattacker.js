//Funktion zur Auslese der Nachrichten, die auf dem Server eingehen
function readMessage(messages) {
    var fs = require("fs");
        for (i = 0; i < length(messages)+1; i++) {
            fs.writeFile("./InternalAttacker/internAttMessage.txt", + new Date().getTime + "\n" + messages[i] + "\n");
        };
}
//Funktion zur Auslese der Registration, die getätigt werden
function readRegistrationData(userobject) {
    var fs = require("fs");
    fs.writeFile("./InternalAttacker/internAttRagistration.txt", + new Date().getTime + "\n" + userobject +"\n")
}
//Funktion zur Auslese der ForeignIds, die erstellt werden
function readForeignId(id) {
    var fs = require("fs");
    fs.writeFile("./InternalAttacker/internAttForeignId.txt", + new Date().getTime + "\n" + id +"\n")
}

module.exports = {
    readMessage,
    readRegistrationData,
    readForeignId
}
    

