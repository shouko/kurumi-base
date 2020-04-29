const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  payload: Object,
}, {
  timestamps: true,
});

schema.methods.getFrom = function () {
  const rgx = /^([^<]+ )?<?(([A-z0-9_-]+)@([^>]+))>?$/;
  const matches = rgx.exec(this.payload.from);
  if (!matches) return false;
  const [, name, address, username, domain] = matches;
  return {
    name, address, username, domain,
  };
};

module.exports = mongoose.model('Mail', schema);
