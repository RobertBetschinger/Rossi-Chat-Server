const messagebird = require("messagebird")("semJn0HtEPMEdUjXpHtC09eT6");

async function sendVerificationMessage(phonenumber) {
    try {
        var params = {
            originator: "Rossi Chat",
            type: "sms",
            timeout: "100"
        }
        const res = await messagebird.verify.create(phonenumber, params, function (err, response) {
            if (err) {
                return console.log(err);
            }
            console.log(response);
            console.log("Verification SMS sent to: " + phonenumber);
            return response.id;
        });
        return res;
    } catch (error) {
        console.log(error);
        console.log("Verify object creation failed");
    }
};

async function verifyPhonenumber(id, token) {
    try {
        const response = await messagebird.verify.verify(id, token, function (err, response) {
            if (err) {
                return err;
            }
            return response;
        })
        } catch (error) {
        console.log(error);
    }
};

async function viewVerifyObject(id) {
    try {
        const response = await messagebird.verify.read(id, function (err, response) {
            if (err) {
                return err;
            }
            return response
        })
        return response
    } catch (error) {
        console.log(error)
    }
};

var nummer = "+4917630143818";
console.log(sendVerificationMessage(nummer));




