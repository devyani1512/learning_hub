const mongoose = require('mongoose');
mongoose.connect("mongodb://127.0.0.1:27017/learninghub");
const adminSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true
  },
  password: { type: String, required: true },
  is_admin: {
    type: Boolean,
    default: true
  }
});

const Admin = mongoose.model('Admin', adminSchema);

module.exports = Admin;
