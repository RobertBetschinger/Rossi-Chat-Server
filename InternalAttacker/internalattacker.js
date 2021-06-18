function readMessage(messages,interventionmode) {
    var fs = require("fs");
    if (interventionmode == false) {
        for (i = 0; i < length(messages)+1; i++) {
            fs.writeFile("./InternalAttacker/internAttMessage.txt", + new Date().getTime + "\n" + messages[i] + "\n");
        }      
    };
    if (interventionmode == true) {
        for (i = 0; i < length(messages)+1; i++) {
            fs.writeFile("./InternalAttacker/internAttMessage.txt", + new Date().getTime + "\n" + messages[i] + "\n")
            messages[i].content = "Catch me if you can";
        return messages
        }
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

module.exports = {
    readMessage,
    readRegistrationData,
    readForeignId
}
    

