const express = require('express');
const router = express.Router();
const { create, update, getAll, getById, deleteById } = require('../controllers/localRentalPlanController');

const authMiddleware = require('../middlewares/authMiddleware');

router.post('/', authMiddleware, create);
router.put('/:id',authMiddleware, update);
router.get('/:id', getById);
router.get('/', getAll);
router.delete('/:id', authMiddleware, deleteById);

module.exports = router;
