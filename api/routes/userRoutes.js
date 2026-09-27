const express = require("express");
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
  createCustomer,
} = require("../controllers/userController");
const authMiddleware = require("../middlewares/authMiddleware");
const admin = require("../middlewares/adminMiddleware");
const selfOrAdmin = require("../middlewares/selfOrAdmin");
const upload = require("../middlewares/multerConfigUser");

const router = express.Router();

// Anyone may register a customer; any other role needs an admin token.
const createGuard = (req, res, next) => {
  const role = (req.body?.role || "customer").toString();
  if (role === "customer") return next();
  return admin(req, res, next);
};

router.get("/", admin, getAllUsers);
router.post("/", createGuard, createUser);
router.post("/verifyToken", verifyToken);

router.post("/login", loginUser);
router.post("/customer-login", loginCustomer);
router.post("/verifyTokenCustomerDriver", verifyTokenByCustomer);
router.post("/send-otp", sendOTP);
router.post("/send-otp-for-login", sendOTPForLogin);
router.post("/verify-otp", verifyOTP);
router.post("/create-customer", createCustomer);

router.get("/:id", authMiddleware, selfOrAdmin, getUserById);
router.put(
  "/:id",
  authMiddleware,
  selfOrAdmin,
  upload.fields([{ name: "image" }, { name: "pan_card" }, { name: "adhar_card" }]),
  updateUser
);
router.delete("/:id", admin, deleteUser);

module.exports = router;
