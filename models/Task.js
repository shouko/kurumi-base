const { Schema, model } = require('mongoose');

const schema = new Schema({
  namespace: String,
  action: { type: String, required: true },
  param: String,
  state: { type: Number, required: true },
  lock: { type: Schema.Types.ObjectId, default: null },
  tags: [String],
  history: [{ state: Number, by: { type: Schema.Types.ObjectId }, timestamp: Date }],
}, {
  timestamps: true,
});

module.exports = model('Task', schema);
