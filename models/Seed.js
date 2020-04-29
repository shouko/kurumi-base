const { Schema, model } = require('mongoose');

const schema = new Schema({
  resource: { type: Schema.Types.ObjectId, ref: 'Resource' },
  tags: { type: [String] },
  uri: { type: String },
}, {
  timestamps: true,
});

module.exports = model('Seed', schema);
