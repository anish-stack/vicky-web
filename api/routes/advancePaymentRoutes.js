const express = require('express');
const router = express.Router();
const { create, get } = require('../controllers/advancePayment');

const authMiddleware = require('../middlewares/authMiddleware');

router.post('/', authMiddleware, create);
router.get('/', get);

module.exports = router;