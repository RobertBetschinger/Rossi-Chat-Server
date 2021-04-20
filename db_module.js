const Datastore = require('nedb');
//iddb = new Datastore({ filename: 'iddatabase', autoload: true });
//msgdb = new Datastore({ filename: 'msgdatabase', autoload: true });

//Function takes input UserObject (userId, phoneNumber, nickName)
function addNewUser (UserObject){
    iddb.insert(UserObject, function(err, newDoc){});
    console.log("User added to database")
};

//Nutzer aus der ID Datenbank löschen
function deleteUser (userId){
    leaver = iddb.find({userId:{userId}}, function (err, docs) {
        console.log(leaver)
    })
    iddb.remove({userId:userId},{}, function (err, numRemoved) {

    });
};

//Telefonnummer für ID ändern

//Nachricht hinzufügen, die nicht zugestellt werden konnte
function addMessage(userId, messageId, creatorId, timestamp, chatId, message){
    messagedata = {userId, messageId, creatorId, timestamp, chatId, message};
    msgdb.insert(messagedata, function(err, newDoc){});
    console.log("New message data stored to serverdb");
};



//Nicht funktionsfähig
function checkUserStatus (userId){
    userFound = false;
    db.find({userId:{userId}}, function (err, docs) {
        userFound = true;
    })
    ///userFound == Object 
    if (userFound = true) {
        console.log("User existing in serverdb")
    }
    if (userFound = false) {
        console.log("user doesnt exist in serverdb")
    }
    return;
};


module.exports = {addNewUser, deleteUser};

