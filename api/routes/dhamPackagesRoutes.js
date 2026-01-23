const express = require('express');
const router = express.Router();
const { create, update, getAll, getById, deleteById } = require('../controllers/dhamPackageController');
const upload = require('../middlewares/multerConfigDham');

const authMiddleware = require('../middlewares/authMiddleware');

router.post('/', upload.single('image'), authMiddleware, create);
router.put('/:id', upload.single('image'), authMiddleware, update);
router.get('/:id', getById);
router.get('/', getAll);
router.delete('/:id', authMiddleware, deleteById);

module.exports = router;