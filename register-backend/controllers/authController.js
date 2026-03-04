const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { initiateRazorpay } = require("../utils/pay");

// Generate Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

// Register
exports.registerUser = async (req, res) => {
  try {
    const {
      name,
      email,
      number,
      category,

      // Tour Guide
      experienceYears,
      languages,
      pricePerDay,
      location,

      // RTO
      servicesOffered,
      officeAddress,
      serviceCharge,

      // Car Mechanic
      garageName,
      garageAddress,
      mechanicExperience,
      emergencyService,
    } = req.body;

    // 🔹 Check existing user
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // 🔹 Create User (category based fields automatically validated by schema)

    const user = await User.create({
      name,
      email,
      number,
      category,

      experienceYears,
      languages,
      pricePerDay,
      location,

      servicesOffered,
      officeAddress,
      serviceCharge,

      garageName,
      garageAddress,
      mechanicExperience,
      emergencyService,
    });

    res.status(201).json({
      success: true,
      data: user,
      token: generateToken(user._id),
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

exports.verifyByAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    // 🔎 Check user exists
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // ✅ Mark as verified
    user.verifiedByAdmin = true;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "User payment verified successfully",
      data: user,
    });

  } catch (error) {
    console.log("Internal server error", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.createPayment = async (req,res) => {
    try {
        const {amount} = req.body;
        const {id} = req.params;
        if(!amount) {
            return res.status(400).json({
                success: false,
                message: "Amount is required"
            })
        }

        const findUser = await User.findById(id);
        if(!findUser){
            return res.status(400).json({
                success: false,
                message:'User not found'
            })
        }

         return await initiateRazorpay(req, res, findUser,amount);
        
    } catch (error) {
        console.log("Internal server error",error)
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

exports.paymentVerify = async (req,res) => {
    try {
        
    } catch (error) {
        console.log("Internal server error", error)
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}