const mongoose = require('mongoose');

const abmkeySchema = new mongoose.Schema({
  id: String,
  payload: String,
}, {
  timestamps: true,
});

abmkeySchema.methods.getBinPayload = function () {
  return Buffer.from(this.payload, 'hex');
};

module.exports = mongoose.model('Abmkey', abmkeySchema);
