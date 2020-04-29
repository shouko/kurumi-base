const { model, Schema } = require('mongoose');

const schema = new Schema({
  key: String,
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  from: Date,
  to: Date,
}, {
  timestamps: true,
});

module.exports = model('License', schema);
