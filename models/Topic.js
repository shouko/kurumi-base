const { model, Schema } = require('mongoose');

const schema = new Schema({
  key: {
    type: String,
    required: true,
    unique: true,
  },
  name: { type: String, default: '' },
  data: Object,
}, {
  timestamps: true,
});

schema.methods.getParsedKey = function () {
  const [namespace, key] = this.key.split(':');
  return { namespace, key };
};

module.exports = model('Topic', schema);
