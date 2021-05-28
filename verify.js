const messagebird = require("messagebird")(process.env.MSGBIRD_TEST_ACCESS_KEY);

function sendVerificationSMS(phonenumber) {
    try {
        var params = {
            originator: "Rossi Chat",
            type: "sms",
            timeout: "10000"
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

async function test(){
    var result  = await sendVerificationSMS()
    console.log(result.id)
    }


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