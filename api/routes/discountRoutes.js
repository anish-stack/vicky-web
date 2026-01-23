const express = require('express');
const router = express.Router();
const { createOrUpdate, getFirstRecord } = require('../controllers/discountController');
const authMiddleware = require('../middlewares/authMiddleware');


router.post('/',authMiddleware, createOrUpdate);
router.get('/', getFirstRecord);

module.exports = router;
