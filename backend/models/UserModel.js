const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Veuillez saisir votre nom"],
    minlength: 3,
    maxlength: 15
  },
  email: {
    type: String,
    required: [true, "Veuillez saisir votre e-mail"],
    validate: [validator.isEmail, "Veuillez saisir un e-mail correct"],
    unique: true,
  },
  password: {
    type: String,
    required: [true, "Veuillez saisir votre mot de passe"],
    minlength: [6, "Le mot de passe doit contenir au moins 6 caractères"],
    select: false,
  },
  avatar: {
    public_id: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
  },
  role: {
    type: String,
    default: "user",
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  resetPasswordToken: String,
  resetPasswordTime: Date,
});

// Hash password
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  this.password = await bcrypt.hash(this.password, 10);
});

// jwt token
userSchema.methods.getJwtToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRES,
  });
};

// compare password
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// password oublié
userSchema.methods.getResetToken = function () {
  // Genere token
  const resetToken = crypto.randomBytes(20).toString("hex");

  //    hashing et ajoute gresetPasswordToken a userSchema
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.resetPasswordTime = Date.now() + 15 * 60 * 1000;

  return resetToken;
};

module.exports = mongoose.model("User", userSchema);
