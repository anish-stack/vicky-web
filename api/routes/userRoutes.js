const express = require('express');
const multer = require('multer');
const { 
    getAllUsers,
    createUser,
    getUserById,
    updateUser,
    deleteUser,
    loginUser,
    verifyToken,
    loginCustomer,
    verifyTokenByCustomer,
    sendOTP,
    verifyOTP,
    sendOTPForLogin,
    createCustomer
} = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');
const router = express.Router();
// const upload = multer();
const upload = require('../middlewares/multerConfigUser');


router.get('/', authMiddleware, getAllUsers);
// router.get('/', getAllUsers);
// router.post('/', upload.none(), createUser);
router.post('/', createUser);
router.post('/verifyToken', verifyToken);

router.get('/:id', getUserById);
router.put('/:id', upload.fields([{ name: 'image' }, { name: 'pan_card' }, { name: 'adhar_card' }]), updateUser);
router.delete('/:id', authMiddleware, deleteUser);

router.post('/login', loginUser);
router.post('/customer-login', loginCustomer);
router.post('/verifyTokenCustomerDriver', verifyTokenByCustomer);

router.post('/send-otp', sendOTP);
router.post('/send-otp-for-login', sendOTPForLogin);

router.post('/verify-otp', verifyOTP);
router.post('/create-customer', createCustomer);

module.exports = router;
