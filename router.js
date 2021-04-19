const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.send('The Server Is Running. <br> This Server is the Backend-Server for The Rossi-Chat, the new Secure Messenger');

});

module.exports =router;