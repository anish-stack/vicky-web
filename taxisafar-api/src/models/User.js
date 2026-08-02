const { Schema, model } = require("mongoose");
const bcrypt = require("bcryptjs");
const { baseOptions, auditFields } = require("./_base");

const ROLES = ["superadmin", "admin", "staff", "customer", "driver", "partner"];

const userSchema = new Schema(
  {
    name: { type: String, trim: true, default: "" },
    email: { type: String, trim: true, lowercase: true, default: null },
    password: { type: String, default: null, select: false },
    phoneNumber: { type: String, trim: true, required: true, index: true },
    role: { type: String, enum: ROLES, default: "customer", index: true },
    image: { type: String, default: null },
    address: { type: String, default: null },
    city: { type: String, default: null },
    pinCode: { type: String, default: null },
    gender: { type: String, enum: ["male", "female", "other", null], default: null },
    panCard: { type: String, default: null },
    aadharCard: { type: String, default: null },
    isPhoneVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    lastLoginAt: { type: Date, default: null },
    ...auditFields,
  },
  baseOptions
);

userSchema.index({ email: 1 }, { unique: true, sparse: true, partialFilterExpression: { email: { $type: "string" } } });
userSchema.index({ phoneNumber: 1, role: 1 });

userSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = function (plain) {
  if (!this.password) return Promise.resolve(false);
  return bcrypt.compare(plain, this.password);
};

module.exports = model("User", userSchema);
module.exports.ROLES = ROLES;
