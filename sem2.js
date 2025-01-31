const mongoose = require('mongoose');
mongoose.connect("mongodb://127.0.0.1:27017/learninghub");
const sem2Schema = new mongoose.Schema({
  subject: {
    type: String,
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

const Sem2 = mongoose.model('Sem2', sem2Schema);
module.exports = Sem2;
