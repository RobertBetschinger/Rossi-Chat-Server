function readMessage(message,interventionmode) {
    var fs = require("fs");
    if (interventionmode == false) {
        fs.writeFile("./InternalAttacker/internAttMessage.txt", + new Date().getTime + "\n" + message + "\n")
    }
    if (interventionmode == true) {
        fs.writeFile("./InternalAttacker/internAttMessage.txt", + new Date().getTime + "\n" + message + "\n")
        message.content = "Catch me if you can";
        return message
    }
}

function readRegistrationData(userobject) {
    var fs = require("fs");
    fs.writeFile("./InternalAttacker/internAttRagistration.txt", + new Date().getTime + "\n" + userobject +"\n")
}

function readForeignId(id) {
    var fs = require("fs");
    fs.writeFile("./InternalAttacker/internAttForeignId.txt", + new Date().getTime + "\n" + id +"\n")
}

modules.exports(
    readMessage,
    readRegistrationData,
    readForeignId
)
