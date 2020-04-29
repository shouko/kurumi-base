const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  login: {
    type: String,
    unique: true,
    required: true,
  },
  nickname: String,
  password: String,
  email: {
    address: { type: String },
    verified: { type: Boolean, default: false },
  },
  birthday: Date,
}, {
  timestamps: true,
});

module.exports = mongoose.model('Mail', schema);
