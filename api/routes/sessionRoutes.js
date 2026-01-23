const express = require('express');
const router = express.Router();
const { createSession, getSessionById, updateSession, getAll } = require('../controllers/sessionController');
const upload = require('../middlewares/multerConfig');

router.post('/', createSession);
router.get('/:id', getSessionById);
router.put('/:id', updateSession);
router.get('/', getAll);

module.exports = router;
