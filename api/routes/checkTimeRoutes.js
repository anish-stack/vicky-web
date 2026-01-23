const express = require('express');
const router = express.Router();
const { checkTime,checkTestTime } = require('../controllers/dateTimeChecker');

router.post('/', checkTime);
// router.post('/test', checkTestTime);
module.exports = router;
