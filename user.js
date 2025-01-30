const mongoose = require('mongoose');
mongoose.connect("mongodb://127.0.0.1:27017/learninghub");
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  otp: {
    type: Number,
    required: false, // OTP is not always required initially
  },
  otpVerified: {
    type: Boolean,
    default: false, // A flag to check if OTP has been verified
  },
});

module.exports = mongoose.model('User', userSchema);
