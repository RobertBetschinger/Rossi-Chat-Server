const Datastore = require('nedb');
//iddb = new Datastore({ filename: 'iddatabase', autoload: true });
//msgdb = new Datastore({ filename: 'msgdatabase', autoload: true });

//Function takes input UserObject (userId, phoneNumber, nickName)
function addNewUser (UserObject){
    iddb.insert(UserObject, function(err, newDoc){
        if (err =! 0) {
            console.log(err);
        }
    });
    console.log("User added to database");
};

//Nutzer aus der ID Datenbank löschen
function deleteUser (userId){
    leaver = iddb.find({userId:{userId}}, function (err, docs) {
        if (err =! 0) {
            console.log(err);
        }
        else {
            console.log(leaver);
        }
    });
    iddb.remove({userId:userId},{}, function (err, numRemoved) {
        if (err =! 0) {
            console.log(err);
        }
        else {
            console.log(numRemoved," User has been removed")
        }
    });
};

//UserId für eine Telefonnummer anfragen
function getUserId (phonenumber){
    iddb.find({number:{phonenumber}}, function(err, docs) {
        if (err =! 0) {
            console.log(err);
        }
        else {
            return docs
        }
        
    });
};

//Telefonnummer für ID ändern
function changePhonenumber(userId,phonenumberNew){
    iddb.update({userId:{userId}}, {number:{phonenumberNew}}, function(err, numReplaced){
        if (err =! 0) {
            console.log(err);
        }
        console.log(numReplaced, " Phonenumber has been changed")
    });
};

//Nickname für ID ändern
function changeNickname(userId,spitzname){
    iddb.update({userId:{userId}}, {spitzname:{spitzname}}, function(err, numReplaced){
        if (err =! 0) {
            console.log(err);
        }
        console.log(numReplaced, " Phonenumber has been changed")
    });
};

//Nachricht hinzufügen, die nicht zugestellt werden konnte
function addMessage(message){
    msgdb.insert(message, function(err, newDoc){
        if (err =! 0) {
            console.log(err);
        }
    });
    console.log("New message stored to serverdb");
};

//Nachricht aus der Nachrichten db entfernen, die zugestellt werden konnte
function deleteMessage(messageId){
    msgdb.find({messageId:{messageId}}, function(err, newDoc){
        if (err =! 0) {
            console.log(err);
        }
    });
    console.log("Message deleted from messagedb");
};

//Ausstehende Nachrichten an einen Empfänger abfragen
function requestMessagelist (userId){
    msgdb.find ({receiverId:{userId}}, function(err, newDoc){
        if (err =! 0) {
            console.log(err);
        }
        else {
            return newDoc
        }
    })
};

function requestIddbcontent(){
    db.find({}, function (err, docs) {
        return docs
    });
}

module.exports = {addNewUser, deleteUser, addMessage, deleteMessage, getUserId, changePhonenumber, requestMessagelist, changeNickname, requestIddbcontent};
