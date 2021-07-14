//Einbezug der Umgebungsvariablen, die auf Heroku hinterlegt sind
require("dotenv").config();
const messagebird = require("messagebird")(process.env.MSGBIRD_PROD_ACCESS_KEY);
//Übergabe der Nutzer-Telefonnummer an die Messagebird Schnittstelle und Auslösen des Versands von einem SMS Token an den Nutzer
function sendVerificationSMS(phonenumber) {
    try {
        var params = {
            originator: "Rossi Chat",
            type: "sms",
            timeout: "60"
        };
        return new Promise((resolve, reject) => {
            messagebird.verify.create(phonenumber, params, function (err, response) {
                if (err) {
                    reject(err)
                }
                resolve(response);
            });
        });
    } catch (error) {
        console.log(error);
        console.log("Verify object creation failed");
    }
};


//Übergabe des Tokens und der zugeordneten ID zum Verifikationsprozess an die Messagebird Verify Schnittstelle zum Abgleich
function verifyMessagebirdToken(id, token) {
    try {
        return new Promise((resolve, reject) => {
            messagebird.verify.verify(id, token, function (err, response) {
                if (err) {
                    reject(err)
                }
                resolve(response);
            });
        });
    } catch (error) {
        console.log(error);
        console.log("Verify API token check failed");
    }
};

module.exports = {
    sendVerificationSMS,
    verifyMessagebirdToken,
};