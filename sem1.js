const mongoose = require('mongoose');
mongoose.connect("mongodb://127.0.0.1:27017/learninghub");
const sem1Schema = new mongoose.Schema({
  subject: {
    type: String,  // Keep it as a string
    required: true
  },
  description: {
    type: String,
    required: true
  },
  link: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true
  },
  added_by: {
    type: String,
    required: true
  }
});

const Sem1 = mongoose.model('Sem1', sem1Schema);
module.exports = Sem1;
