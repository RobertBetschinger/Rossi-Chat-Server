const messagebird = require("messagebird")("ClY2MXXiTmw89CgfrvA8OCoW8");

 function sendVerificationMessage(phonenumber) {
   
    try {
        var params = {
            originator: "Rossi Chat",
            type: "sms",
            timeout: "100"
        }
        messagebird.verify.create(phonenumber, params, function (err, response) {
            if (err) {
                return console.log(err);
            }
            goOn(response);
        })    
    } catch (error) {
        console.log(error);
        console.log("Verify object creation failed");
    }
};
    
function goOn(response){
console.log(response)
}

//sendVerificationMessage("+49016092606699")
smsobject = {
    id:""
}
function sendVerificationMessagePromise(phonenumber){
    
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
            resolve(response);
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





