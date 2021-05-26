const messagebird = require("messagebird")(process.env.MSGBIRD_TEST_ACCESS_KEY);


async function sendVerificationSMS(phonenumber){
    try {
        var params = {
            originator: "Rossi Chat",
            type: "sms",
            timeout: "60"
        }
     return new Promise((resolve, reject)=>{
        messagebird.verify.create(phonenumber, params, function (err, response) {
            if (err) {
                reject(err)
            }
            resolve(response.id);
        });
      });
    } catch (error) {
        console.log(error);
        console.log("Verify object creation failed");
    }
};
    
function goOn(response){
console.log(response)
}

//sendVerificationMessage("+49016092606699")

function sendVerificationMessagePromise(phonenumber){
    smsobject = {
        id:""
    }
    try {
        var params = {
            originator: "Rossi Chat",
            type: "sms",
            timeout: "100"
        }
     return new Promise((resolve, reject)=>{
        messagebird.verify.create(phonenumber, params, function (err, response) {
            if (err) {
                reject(err)
            }
            smsobject.id = response.id
            resolve(response.id);
        })    

      })
    } catch (error) {
        console.log(error);
        console.log("Verify object creation failed");
    }
}


//test()
async function test(){
var result  = await sendVerificationMessagePromise("+49016092606699")
console.log(result)
}



Promise.all([sendVerificationMessagePromise("+49016092606699")]).then(((values)=> console.log(values)))





async function waitForMessagebirdAnswer(nummer){
    var result  = await sendVerificationSMS(nummer)
    console.log("Messagebird SMS sent and ID creation successful: " + result.id);
    return result.id
    };
   


async function verifyMessagebirdToken(id, token){
    try {
     return new Promise((resolve, reject)=>{
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

async function waitForTokenCheck(id, token){
    var result  = await verifyMessagebirdToken(id, token)
    console.log("Token and id Ckeck: " + result.status);
    return result.status
    };

module.exports = {
    sendVerificationSMS,
    verifyMessagebirdToken,
}