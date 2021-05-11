const mongoose = require ("mongoose");

const chatgroupSchema = new mongoose.Schema({
    privateChatID: {
        type: String,
        required: true,
    },
    groupName:{
        type: String,
        required:true,
    },
    groupDescription: {
        type: String,
        required: false,
    },
    //Was kommt hier alles rein
    participants: [{
        paricipantPermanentId:{
            type:mongoose.Schema.Types.privateuserId, ref:'User', required:true,},
        participantForeignId:{
            type:mongoose.Schema.Types.foreignId, ref:'User', required:true,}
    }],
    //Evtl kommt später dann hier noch was zu den Keys rein. Für einfacher einfach die ForeignKeys und privateKeys kinzufügen ohne verweis auf das Objekt
},
{ versionKey: false }
);

const Chatgroup = mongoose.model('Chatgroup', chatgroupSchema);

module.exports =(Chatgroup);