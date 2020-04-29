const mongoose = require('mongoose');
const { parseFrom } = require('../utils/email');

const schema = new mongoose.Schema({
  payload: Object,
}, {
  timestamps: true,
});

schema.methods.getFrom = function () {
  return parseFrom(this.payload.from);
};

module.exports = mongoose.model('Mail', schema);
