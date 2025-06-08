const express = require('express');
const router = express.Router();

const registerRoute = require('./register');

router.use(registerRoute);

module.exports = router;
