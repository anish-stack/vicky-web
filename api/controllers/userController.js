const Joi = require("joi");
// const User = require('../models/user');
require("dotenv").config();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { User, otp } = require("../models");
//const { Transaction } = require("../models");
const axios = require("axios");
const path = require("path");
const fs = require("fs");
const { parsePhoneNumber } = require("libphonenumber-js");

function getCountryCodeAndNumber(phone) {
  try {
    const phoneNumber = parsePhoneNumber(phone);

    if (phoneNumber) {
      return {
        countryCode: phoneNumber.countryCallingCode,
        number: phoneNumber.nationalNumber,
      };
    }
  } catch (error) {
    console.error("Invalid phone number:", error.message);
  }
  return null;
}

const SECRET_KEY = process.env.JWT_SECRET || "mysecretkey";

const { Op } = require("sequelize");

// exports.getAllUsers = async (req, res) => {
//     try {
//         const users = await User.findAll({
//             where: {
//                 role: {
//                     [Op.ne]: 'superadmin'
//                 }
//             }
//         });

//         res.status(200).json({
//             status: true,
//             data: users,
//             message: 'User Listing fetch successfully.'
//         });
//     } catch (error) {
//         res.status(500).json({
//             status: false,
//             message: error.message
//         });
//     }
// };

exports.getAllUsers = async (req, res) => {
  try {
    const { page = 1, items_per_page, search = "", role } = req.query;

    const totalCount = await User.count({
      where: {
        role: {
          [Op.ne]: "superadmin",
        },
      },
    });

    const pageNumber = parseInt(page, 10);
    const itemsPerPage = items_per_page
      ? parseInt(items_per_page, 10)
      : totalCount;

    const whereCondition = {
      ...(search && {
        [Op.or]: [{ name: { [Op.like]: `%${search}%` } }],
      }),
      ...(role
        ? { role: { [Op.eq]: role, [Op.ne]: "superadmin" } }
        : { role: { [Op.ne]: "superadmin" } }),
    };

    const { count, rows: Users } = await User.findAndCountAll({
      where: whereCondition,
      offset: (pageNumber - 1) * itemsPerPage,
      limit: itemsPerPage,
      order: [["name", "ASC"]],
    });

    const totalPages = Math.ceil(count / itemsPerPage);
    const from = (pageNumber - 1) * itemsPerPage + 1;
    const to = Math.min(pageNumber * itemsPerPage, count);

    const UsersWithIndex = Users.map((quotation, index) => ({
      ...quotation.toJSON(),
      index_no: from + index,
    }));

    const links = [];

    if (pageNumber > 1) {
      links.push({
        label: "Previous",
        page: pageNumber - 1,
        url: `/?page=${pageNumber - 1}&items_per_page=${itemsPerPage}`,
      });
    }

    for (let i = 1; i <= totalPages; i++) {
      links.push({
        label: i.toString(),
        page: i,
        url: `/?page=${i}&items_per_page=${itemsPerPage}`,
      });
    }

    if (pageNumber < totalPages) {
      links.push({
        label: "Next",
        page: pageNumber + 1,
        url: `/?page=${pageNumber + 1}&items_per_page=${itemsPerPage}`,
      });
    }

    const pagination = {
      first_page_url: `/?page=1&items_per_page=${itemsPerPage}`,
      from,
      items_per_page: itemsPerPage,
      last_page: totalPages,
      items_per_pages: [10, 20, 50, 100, 150],
      next_page_url:
        pageNumber < totalPages
          ? `/?page=${pageNumber + 1}&items_per_page=${itemsPerPage}`
          : null,
      page: pageNumber,
      prev_page_url:
        pageNumber > 1
          ? `/?page=${pageNumber - 1}&items_per_page=${itemsPerPage}`
          : null,
      to,
      total: count,
      links,
    };

    res.status(200).json({
      status: true,
      data: UsersWithIndex,
      payload: {
        pagination: pagination,
      },
      message: "Users fetched successfully",
    });
  } catch (error) {
    console.error("Error fetching Users:", error);
    res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};

exports.createUser = async (req, res) => {
  try {
    let { name, email, password, phone_number, role } = req.body;
    email = email || null;
    password = password || null;
    const userSchema = Joi.object({
      name: Joi.string().required().messages({
        "string.empty": "Name is required",
        "any.required": "Name is required",
      }),
      phone_number: Joi.string().required().messages({
        "string.empty": "Phone Number is required",
        "any.required": "Phone Number is required",
      }),
      role: Joi.string().required().messages({
        "string.empty": "Role is required",
        "any.required": "Role is required",
      }),
    }).unknown(true);

    const { error } = userSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.json({
        status: false,
        message: error?.details[0]?.message,
      });
    }
    const existingUser = await User.findOne({ where: { phone_number } });
    if (existingUser) {
      return res.json({
        data: existingUser,
        status: false,
        message: "This User already registered",
      });
    }
    const user = await User.create({
      name,
      email,
      password,
      phone_number,
      role,
    });
    res.status(200).json({
      status: true,
      data: user,
      message: "Regestered Successfully!",
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);
    if (user) {
      res.status(200).json({
        status: true,
        data: user,
        message: "User Details Fetched",
      });
    } else {
      res.status(404).json({
        status: false,
        message: "User Not Found",
      });
    }
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    let { name, email, address, city, pin_code, gender, phone_number } =
      req.body;

    email = email || null;
    const userSchema = Joi.object({
      // name: Joi.string().required().messages({
      //     'string.empty': 'Name is required',
      //     'any.required': 'Name is required',
      // }),
    }).unknown(true);
    const { error } = userSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.json({
        status: false,
        message: error?.details[0]?.message,
      });
    }
    const existingUser = await User.findOne({
      where: { phone_number, id: { $ne: id } },
    });
    if (existingUser) {
      return res.json({
        status: false,
        message: "This user already registered",
      });
    }
    const user = await User.findByPk(id);
    if (user) {
      if (req.files) {
        if (req.files.image) {
          if (user.image) {
            const existingImagePath = path.join(
              __dirname,
              "../public/users",
              user.image
            );
            if (fs.existsSync(existingImagePath)) {
              fs.unlinkSync(existingImagePath);
            }
          }
          user.image = req.files.image[0].filename;
        }

        if (req.files.pan_card) {
          if (user.pan_card) {
            const existingPanCardPath = path.join(
              __dirname,
              "../public/users",
              user.pan_card
            );
            if (fs.existsSync(existingPanCardPath)) {
              fs.unlinkSync(existingPanCardPath);
            }
          }
          user.pan_card = req.files.pan_card[0].filename;
        }

        if (req.files.adhar_card) {
          if (user.adhar_card) {
            const existingAdharCardPath = path.join(
              __dirname,
              "../public/users",
              user.adhar_card
            );
            if (fs.existsSync(existingAdharCardPath)) {
              fs.unlinkSync(existingAdharCardPath);
            }
          }
          user.adhar_card = req.files.adhar_card[0].filename;
        }
      }
      user.name = name ? name : user.name;
      user.email = email ? email : user.email;
      user.address = address ? address : user.address;
      user.city = city ? city : user.city;
      user.pin_code = pin_code ? pin_code : user.pin_code;
      user.gender = gender ? gender : user.gender;
      await user.save();

      res.status(200).json({
        status: true,
        data: user,
        message: "Updated Successfully",
      });
    } else {
      res.status(404).json({
        status: false,
        message: "User Not Found",
      });
    }
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);
    if (user) {
      await user.destroy();
      res.status(200).json({
        status: true,
        data: user,
        message: "User deleted successfully",
      });
    } else {
      res.status(404).json({
        status: false,
        message: "User Not Found",
      });
    }
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { email, password, phone_number } = req.body;
    // let user = await User.findOne({ where: { email } });
    let user = null;
    if (phone_number) {
      user = await User.findOne({ where: { phone_number } });
    } else {
      user = await User.findOne({ where: { email } });
    }
    if (!user) {
      return res.json({ status: false, message: "Not Registered!!" });
    }

    if (user.role == "superadmin" || user.role == "driver") {
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.json({ status: false, message: "Invalid credentials" });
      }

      const token = jwt.sign({ id: user.id, email: user.email }, SECRET_KEY, {
        expiresIn: "1d",
      });
      res.json({
        status: true,
        message: "Login successful",
        data: { token: token },
      });
    } else {
      res.json({ status: false, message: "Unauthorised" });
    }
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
};

exports.verifyToken = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.json({ status: false, message: "Token is required" });
    }

    const decoded = jwt.verify(token, SECRET_KEY);
    const user = await User.findByPk(decoded.id);
    if (!user) {
      return res.json({ status: false, message: "User not found" });
    }

    if (user.role == "superadmin") {
      res.json({
        status: true,
        user: user,
        message: "user fetched successfully",
      });
    } else {
      res.json({ status: false, message: "unauthorised" });
    }
  } catch (error) {
    res
      .status(401)
      .json({ status: false, message: "Invalid or expired token" });
  }
};

exports.loginCustomer = async (req, res) => {
  try {
    const { phone_number, OTP } = req.body;

    const Schema = Joi.object({
      phone_number: Joi.string().required().min(5).max(15).messages({
        "any.required": "Phone number is required",
        "string.min": "Phone number must be at least 5 characters long",
        "string.max": "Phone number cannot be more than 15 characters long",
      }),
      OTP: Joi.string()
        .required()
        .pattern(/^\d{4}$/)
        .messages({
          "string.empty": "OTP is required",
          "any.required": "OTP is required",
          "string.pattern.base": "OTP must be a 4-digit number",
        }),
    }).unknown(true);

    const { error } = Schema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.json({
        status: false,
        message: error?.details[0]?.message,
      });
    }

    const otpRecord = await otp.findOne({
      where: {
        phone_number,
        otp: OTP,
        expires_at: { [Op.gt]: new Date() },
      },
    });

    if (!otpRecord) {
      return res.json({ status: false, message: "Invalid or expired OTP!" });
    }

    const customer = await User.findOne({
      where: { phone_number: phone_number },
    });

    if (!customer) {
      return res.json({ status: false, message: "Customer not found" });
    }

    const token = jwt.sign(
      {
        id: customer.id,
        phone_number: customer.phone_number,
        role: customer.role,
      },
      SECRET_KEY,
      { expiresIn: "1h" }
    );

    res.json({
      status: true,
      message: "Login successful",
      data: { token: token },
    });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
};

exports.verifyTokenByCustomer = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.json({ status: false, message: "Token is required" });
    }
    const decoded = jwt.verify(token, SECRET_KEY);
    const user = await User.findByPk(decoded.id);
    if (!user) {
      return res.json({ status: false, message: "User not found" });
    }

    if (user.role == "customer" || user.role == "driver") {
      res.json({
        status: true,
        data: user,
        message: "data fetched successfully",
      });
    } else {
      res.json({ status: false, message: "unauthorised" });
    }
  } catch (error) {
    res
      .status(401)
      .json({ status: false, message: "Invalid or expired token" });
  }
};

exports.getUserProfile = async (req, res) => {
	try {
		const { id } = req.user;
 
		const user = await User.findByPk(id);
		if (user) {
			res.status(200).json({
				status: true,
				data: user,
				message: "User Details Fetched",
			});
		} else {
			res.status(404).json({
				status: false,
				message: "User Not Found",
			});
		}
	} catch (error) {
		res.status(500).json({
			status: false,
			message: error.message,
		});
	}
};

exports.updateUserProfile = async (req, res) => {
	try {
		const { id } = req.user;
		let { name} =	req.body;

		const userSchema = Joi.object({
			name: Joi.string().required().messages({
			    'string.empty': 'Name is required',
			    'any.required': 'Name is required',
			}),
		}).unknown(true);
		const { error } = userSchema.validate(req.body, { abortEarly: false });
		if (error) {
			return res.json({
				status: false,
				message: error?.details[0]?.message,
			});
		}
	
		const user = await User.findByPk(id);
		if (user) {
			console.log("user",user)
			user.name = name ? name : user.name;
	
			await user.save();

			res.status(200).json({
				status: true,
				data: user,
				message: "Details Updated Successfully",
			});
		} else {
			res.status(404).json({
				status: false,
				message: "User Not Found",
			});
		}
	} catch (error) {
		res.status(500).json({
			status: false,
			message: error.message,
		});
	}
};

// exports.sendOTP = async (req, res) => {
//     const { phone_number } = req.body;
//     const Schema = Joi.object({
//         phone_number: Joi.string()
//             .required()
//             .min(5)
//             .max(15)
//             .messages({
//                 'any.required': 'Phone number is required',
//                 'string.min': 'Phone number must be at least 5 characters long',
//                 'string.max': 'Phone number cannot be more than 15 characters long',
//             }),
//     }).unknown(true);

//     const { error } = Schema.validate(req.body, { abortEarly: false });
//     if (error) {
//         return res.json({
//             status: false,
//             message: error?.details[0]?.message,
//         });
//     }

//     const OTP = Math.floor(1000 + Math.random() * 9000).toString();
//     const expires_at = new Date(Date.now() + 10 * 60 * 1000);
//     let buzzx_phonenumber = phone_number;

//     if (buzzx_phonenumber.startsWith('+')) {
//         buzzx_phonenumber = buzzx_phonenumber.substring(1);
//     }

//     try {
//         await axios.post(
//             `https://buzzx.io/api/${process.env.BUZZX_ID}/contact/send-template-message?token=${process.env.BUZZX_TOKEN}`,
//             {
//                 phone_number: buzzx_phonenumber,
//                 template_name: process.env.BUZZX_TEMPLATE,
//                 template_language: process.env.BUZZX_TEMPLATE_LANGUAGE,
//                 field_1: OTP,
//                 button_0: OTP,
//             }
//         );

//         const existingOTP = await otp.findOne({ where: { phone_number: phone_number } });

//         if (existingOTP) {
//             await existingOTP.update({ otp: OTP, expires_at });
//         } else {
//             await otp.create({ phone_number: phone_number, otp: OTP, expires_at });
//         }

//         return res.json({ status: true, message: "OTP sent successfully!" });
//     } catch (error) {
//         console.error("Error sending OTP:", error);
//         return res.status(500).json({ status: false, message: "Failed to send OTP" });
//     }
// };

// exports.verifyOTPAndCreateCustomer = async (req, res) => {
//     const { phone_number, OTP, name } = req.body;

//     const Schema = Joi.object({
//         phone_number: Joi.string()
//             .required()
//             .min(5)
//             .max(15)
//             .messages({
//                 'any.required': 'Phone number is required',
//                 'string.min': 'Phone number must be at least 5 characters long',
//                 'string.max': 'Phone number cannot be more than 15 characters long',
//             }),
//         OTP: Joi.string()
//             .required()
//             .pattern(/^\d{4}$/)
//             .messages({
//                 'string.empty': 'OTP is required',
//                 'any.required': 'OTP is required',
//                 'string.pattern.base': 'OTP must be a 4-digit number',
//             }),
//         name: Joi.string()
//             .required()
//             .messages({
//                 'any.required': 'Name is required',
//                 'string.empty': 'Name is required',
//             }),
//     }).unknown(true);

//     const { error } = Schema.validate(req.body, { abortEarly: false });
//     if (error) {
//         return res.json({
//             status: false,
//             message: error?.details[0]?.message,
//         });
//     }

//     try {
//         const otpRecord = await otp.findOne({
//             where: {
//                 phone_number,
//                 otp: OTP,
//                 expires_at: { [Op.gt]: new Date() }
//             },
//         });

//         if (!otpRecord) {
//             return res.json({ status: false, message: "Invalid or expired OTP!" });
//         }

//         let user = await User.findOne({ where: { phone_number } });

//         if (user) {
//             await user.update({ name, updated_at: new Date() });
//         } else {
//             user = await User.create({ name, phone_number, role: 'customer' });
//         }

//         await otp.destroy({ where: { phone_number } });

//         return res.json({ status: true, message: "OTP verified successfully!", data: user });
//     } catch (error) {
//         return res.status(500).json({ status: false, message: "Failed to verify OTP" });
//     }
// };

exports.verifyOTP = async (req, res) => {
  const { phone_number, OTP, name } = req.body;

  const Schema = Joi.object({
    phone_number: Joi.string().required().min(5).max(15).messages({
      "any.required": "Phone number is required",
      "string.min": "Phone number must be at least 5 characters long",
      "string.max": "Phone number cannot be more than 15 characters long",
    }),
    OTP: Joi.string()
      .required()
      .pattern(/^\d{4}$/)
      .messages({
        "string.empty": "OTP is required",
        "any.required": "OTP is required",
        "string.pattern.base": "OTP must be a 4-digit number",
      }),
  }).unknown(true);

  const { error } = Schema.validate(req.body, { abortEarly: false });
  if (error) {
    return res.json({
      status: false,
      message: error?.details[0]?.message,
    });
  }

  try {
		const otpRecord = await otp.findOne({
			where: {
				phone_number,
				otp: OTP,
				expires_at: { [Op.gt]: new Date() },
			},
		});

		if (!otpRecord) {
			return res.json({ status: false, message: "Invalid or expired OTP!" });
		}

		let user = await User.findOne({ where: { phone_number } });
    // console.log("name", name);
    // console.log("user", user.id, user.name);
    if (user) {
			await user.update({  updated_at: new Date() });
		} else {
			user = await User.create({ name, phone_number, role: "customer" });
		}

		await otp.destroy({ where: { phone_number, otp_type: "login" } });
		const token = jwt.sign(
			{
				id: user.id,
				phone_number: user.phone_number,
				role: user.role,
			},
			SECRET_KEY,
			{ expiresIn: "1h" }
		);
		// Convert Sequelize user instance to plain object if needed
		const userData = user.toJSON ? user.toJSON() : user;
		return res.json({
			status: true,
			message: "OTP verified successfully!",
			data: {
				...userData,
				token, // ✅ token included here
			},
		});
	} catch (error) {
    return res
      .status(500)
      .json({ status: false, message: "Failed to verify OTP" });
  }
};

exports.createCustomer = async (req, res) => {
  const { phone_number, OTP, name } = req.body;

  const Schema = Joi.object({
    phone_number: Joi.string().required().min(5).max(15).messages({
      "any.required": "Phone number is required",
      "string.min": "Phone number must be at least 5 characters long",
      "string.max": "Phone number cannot be more than 15 characters long",
    }),
  }).unknown(true);

  const { error } = Schema.validate(req.body, { abortEarly: false });
  if (error) {
    return res.json({
      status: false,
      message: error?.details[0]?.message,
    });
  }

  try {
    let user = await User.findOne({ where: { phone_number } });

    if (user) {
      await user.update({ name, updated_at: new Date() });
    } else {
      user = await User.create({ name, phone_number, role: "customer" });
    }

    return res.json({
      status: true,
      message: "Customer Created Successfully",
      data: user,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ status: false, message: "Failed To Create The Customer" });
  }
};

exports.sendOTP = async (req, res) => {
  const { phone_number } = req.body;
  const Schema = Joi.object({
    phone_number: Joi.string().required().min(5).max(15).messages({
      "any.required": "Phone number is required",
      "string.min": "Phone number must be at least 5 characters long",
      "string.max": "Phone number cannot be more than 15 characters long",
    }),
  }).unknown(true);

  const { error } = Schema.validate(req.body, { abortEarly: false });
  if (error) {
    return res.json({
      status: false,
      message: error?.details[0]?.message,
    });
  }

  const OTP = Math.floor(1000 + Math.random() * 9000).toString();
  const expires_at = new Date(Date.now() + 10 * 60 * 1000);
  const phoneNumber = await getCountryCodeAndNumber(phone_number);
  console.log("Before");
  if (phoneNumber?.countryCode && phoneNumber?.number) {
    try {
      const fast2smsApiKey = process.env.FAST2SMS_API_KEY;
      const fast2smsUrl = `https://www.fast2sms.com/dev/bulkV2?authorization=${fast2smsApiKey}&route=dlt&sender_id=TAXISF&message=181787&variables_values=${OTP}&flash=0&numbers=${phoneNumber?.number}`;
      // console.log("after");
      // console.log(fast2smsUrl);
      await axios.get(fast2smsUrl);
      const existingOTP = await otp.findOne({
        where: { phone_number: phone_number, otp_type: "login" },
      });
      console.log(JSON.stringify(existingOTP, null, 2));
      console.log(OTP, expires_at);
      if (existingOTP) {
        await existingOTP.update({ otp: OTP, expires_at });
      } else {
        console.log("Login otp create");
        await otp.create({
          phone_number: phone_number,
          otp: OTP,
          otp_type: "login",
          expires_at,
        });
      }

      return res.json({ status: true, message: "OTP sent successfully!" });
    } catch (error) {
      console.error("Error sending OTP:", error);
      return res
        .status(500)
        .json({ status: false, message: "Failed to send OTP" });
    }
  } else {
    return res.json({
      status: false,
      message: "Something went wrong",
    });
  }
};

exports.sendOTPForLogin = async (req, res) => {
  const { phone_number } = req.body;
  const Schema = Joi.object({
    phone_number: Joi.string().required().min(5).max(15).messages({
      "any.required": "Phone number is required",
      "string.min": "Phone number must be at least 5 characters long",
      "string.max": "Phone number cannot be more than 15 characters long",
    }),
  }).unknown(true);

  const { error } = Schema.validate(req.body, { abortEarly: false });
  if (error) {
    return res.json({
      status: false,
      message: error?.details[0]?.message,
    });
  }

  const user = await User.findOne({ where: { phone_number } });
  console.log("user", user);
  if (user) {
    const OTP = Math.floor(1000 + Math.random() * 9000).toString();
    const expires_at = new Date(Date.now() + 10 * 60 * 1000);
    const phoneNumber = await getCountryCodeAndNumber(phone_number);

    if (phoneNumber?.countryCode && phoneNumber?.number) {
      try {
        const fast2smsApiKey = process.env.FAST2SMS_API_KEY;
        const fast2smsUrl = `https://www.fast2sms.com/dev/bulkV2?authorization=${fast2smsApiKey}&route=dlt&sender_id=TAXISF&message=181787&variables_values=${OTP}&flash=0&numbers=${phoneNumber?.number}`;

        await axios.get(fast2smsUrl);

        // const existingOTP = await otp.findOne({
        //   where: { phone_number: phone_number, otp_type: "login" },
        // });
        console.log(phone_number);
        const existingOTP = await otp.findOne({
          where: { phone_number: phone_number, otp_type: "login" },
        });
        console.log(JSON.stringify(existingOTP, null, 2));
        if (existingOTP) {
          await existingOTP.update({ otp: OTP, expires_at });
        } else {
          await otp.create({
            phone_number: phone_number,
            otp: OTP,
            expires_at,
          });
        }

        return res.json({ status: true, message: "OTP sent successfully!" });
      } catch (error) {
        console.error("Error sending OTP:", error);
        return res
          .status(500)
          .json({ status: false, message: "Failed to send OTP" });
      }
    } else {
      return res.json({
        status: false,
        message: "Something went wrong",
      });
    }
  } else {
    return res.json({
      status: false,
      message: "Customer is not registered!!",
    });
  }
};

// exports.sendOTP = async (req, res) => {
//     const { phone_number } = req.body;
//     const Schema = Joi.object({
//         phone_number: Joi.string()
//             .required()
//             .min(5)
//             .max(15)
//             .messages({
//                 'any.required': 'Phone number is required',
//                 'string.min': 'Phone number must be at least 5 characters long',
//                 'string.max': 'Phone number cannot be more than 15 characters long',
//             }),
//     }).unknown(true);

//     const { error } = Schema.validate(req.body, { abortEarly: false });
//     if (error) {
//         return res.json({
//             status: false,
//             message: error?.details[0]?.message,
//         });
//     }

//     const OTP = Math.floor(1000 + Math.random() * 9000).toString();
//     const expires_at = new Date(Date.now() + 10 * 60 * 1000);
//     const phoneNumber = await getCountryCodeAndNumber(phone_number);

//     if (phoneNumber?.countryCode && phoneNumber?.number) {
//         try {
//             const payload = {
//                 phone_number_id: "603250552863231",
//                 customer_country_code: phoneNumber?.countryCode,
//                 customer_number: phoneNumber?.number,
//                 data: {
//                     type: "template",
//                     language: "en",
//                     context: {
//                         template_name: "website",
//                         language: "en",
//                         body: {
//                             otp: OTP
//                         },
//                         buttons: [
//                             {
//                                 otp: OTP,
//                                 index: 0
//                             }
//                         ]
//                     }
//                 },
//                 reply_to: null
//             };

//             const headers = {
//                 Authorization: `Bearer ${process.env.MYOPERATOR_API_KEY}`,
//                 "X-MYOP-COMPANY-ID": process.env.MYOPERATOR_COMPANY_ID,
//                 "Content-Type": "application/json"
//             };

//             await axios.post("https://publicapi.myoperator.co/chat/messages", payload, { headers });
//             const existingOTP = await otp.findOne({ where: { phone_number: phone_number } });

//             if (existingOTP) {
//                 await existingOTP.update({ otp: OTP, expires_at });
//             } else {
//                 await otp.create({ phone_number: phone_number, otp: OTP, expires_at });
//             }

//             return res.json({ status: true, message: "OTP sent successfully!" });
//         } catch (error) {
//             console.error("Error sending OTP:", error);
//             return res.status(500).json({ status: false, message: "Failed to send OTP" });
//         }
//     } else {
//         return res.json({
//             status: false,
//             message: 'Something went wrong',
//         });
//     }

// };

// exports.sendOTPForLogin = async (req, res) => {
//     const { phone_number } = req.body;
//     const Schema = Joi.object({
//         phone_number: Joi.string()
//             .required()
//             .min(5)
//             .max(15)
//             .messages({
//                 'any.required': 'Phone number is required',
//                 'string.min': 'Phone number must be at least 5 characters long',
//                 'string.max': 'Phone number cannot be more than 15 characters long',
//             }),
//     }).unknown(true);

//     const { error } = Schema.validate(req.body, { abortEarly: false });
//     if (error) {
//         return res.json({
//             status: false,
//             message: error?.details[0]?.message,
//         });
//     }

//     const user = await User.findOne({ where: { phone_number } });

//     if (user) {
//         const OTP = Math.floor(1000 + Math.random() * 9000).toString();
//         const expires_at = new Date(Date.now() + 10 * 60 * 1000);
//         const phoneNumber = await getCountryCodeAndNumber(phone_number);

//         if (phoneNumber?.countryCode && phoneNumber?.number) {
//             try {
//                 const payload = {
//                     phone_number_id: "603250552863231",
//                     customer_country_code: phoneNumber?.countryCode,
//                     customer_number: phoneNumber?.number,
//                     data: {
//                         type: "template",
//                         language: "en",
//                         context: {
//                             template_name: "website",
//                             language: "en",
//                             body: {
//                                 otp: OTP
//                             },
//                             buttons: [
//                                 {
//                                     otp: OTP,
//                                     index: 0
//                                 }
//                             ]
//                         }
//                     },
//                     reply_to: null
//                 };

//                 const headers = {
//                     Authorization: `Bearer ${process.env.MYOPERATOR_API_KEY}`,
//                     "X-MYOP-COMPANY-ID": process.env.MYOPERATOR_COMPANY_ID,
//                     "Content-Type": "application/json"
//                 };

//                 await axios.post("https://publicapi.myoperator.co/chat/messages", payload, { headers });

//                 const existingOTP = await otp.findOne({ where: { phone_number: phone_number } });

//                 if (existingOTP) {
//                     await existingOTP.update({ otp: OTP, expires_at });
//                 } else {
//                     await otp.create({ phone_number: phone_number, otp: OTP, expires_at });
//                 }

//                 return res.json({ status: true, message: "OTP sent successfully!" });
//             } catch (error) {
//                 console.error("Error sending OTP:", error);
//                 return res.status(500).json({ status: false, message: "Failed to send OTP" });
//             }
//         } else {
//             return res.json({
//                 status: false,
//                 message: 'Something went wrong',
//             });
//         }
//     } else {
//         return res.json({
//             status: false,
//             message: 'Customer is not registered!!',
//         });
//     }
// };
