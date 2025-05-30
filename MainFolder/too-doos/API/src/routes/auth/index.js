const express = require('express');
const router = express.Router();

const registerRoute = require('./register');

router.use(registerRoute); // obsługuje /register

module.exports = router;
