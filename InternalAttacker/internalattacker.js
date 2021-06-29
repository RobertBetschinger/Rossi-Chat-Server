function readMessage(messages,interventionmode) {
    var fs = require("fs");
    if (messages.length != undefined) {
        if (interventionmode == false) {
            for (i = 0; i < messages.length +1; i++) {
                fs.appendFile("./InternalAttacker/Message.txt", + new Date() + "     " + JSON.stringify(messages[i]) + "\n", function (err) {
                    if (err) throw err;
                });
            }      
        };
        if (interventionmode == true) {
            for (i = 0; i < length(messages)+1; i++) {
                fs.appendFile("./InternalAttacker/Message.txt", + new Date() + "     " + JSON.stringify(messages[i]) + "\n", function(err) {
                    if (err) throw err;
                });
                messages[i].content = "Catch me if you can";
            return messages
            }
        }
    }
        
}

function readRegistrationData(userobject) {
    var fs = require("fs");
    fs.appendFile("./InternalAttacker/Registration.txt", + new Date() + "     " + JSON.stringify(userobject) +"\n", function(err) {
        if(err) throw err;
    });
}

function readForeignId(id) {
    var fs = require("fs");
    fs.appendFile("./InternalAttacker/ForeignId.txt", + new Date() + "     " + id +"\n", function(err) {
        if (err) throw err;
    });
}

module.exports = {
    readMessage,
    readRegistrationData,
    readForeignId
}
    

