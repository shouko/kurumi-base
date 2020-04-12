const { Schema, model } = require('mongoose');

const schema = new Schema({
  id: String,
  contentType: String,
  contentLength: Number,
  name: String,
}, {
  timestamps: true,
});

module.exports = model('Resource', schema);
