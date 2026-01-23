const express = require('express');
const router = express.Router();
const { createVehicle, updateVehicle, getById, getAll, deleteById } = require('../controllers/vehicleController'); // Adjust the path as needed
const upload = require('../middlewares/multerConfig');

// Route to create a vehicle
router.post('/', upload.single('image'), createVehicle);
router.put('/:id', upload.single('image'), updateVehicle);
router.get('/:id', getById);
router.get('/', getAll);
router.delete('/:id', deleteById);

module.exports = router;
