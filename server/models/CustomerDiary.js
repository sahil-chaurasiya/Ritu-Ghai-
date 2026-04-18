const mongoose = require('mongoose');

const customerDiarySchema = new mongoose.Schema({
  url: {
    type: String,
    required: [true, 'Photo URL is required']
  },
  caption: {
    type: String,
    default: ''
  },
  order: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('CustomerDiary', customerDiarySchema);
