const mongoose = require('mongoose');
mongoose.connect("mongodb://127.0.0.1:27017/learninghub");
const cardSchema = new mongoose.Schema({
  image: {
    type: String,
    default: null
  },
  subject: {
    type: String,
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
    required: true
  }
});

const Card = mongoose.model('Card', cardSchema);

module.exports = Card;
