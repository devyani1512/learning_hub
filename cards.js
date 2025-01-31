const mongoose = require('mongoose');
mongoose.connect("mongodb://127.0.0.1:27017/learninghub");
const cardSchema = new mongoose.Schema({
  image: {
    type: String,
    default: null
  },
  subject: {
    type: String,  // Keep subject as a string
    required: true
  },
  description: {
    type: String,
    required: true
  },
  sem: {
    type: Number,
    required: true
  },
  added_by: {
    type: String,
  }
});

const Card = mongoose.model('Card', cardSchema);
module.exports = Card;

