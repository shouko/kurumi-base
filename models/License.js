const { model, Schema } = require('mongoose');

const parseDate = (v, end) => {
  if (v instanceof Date) return v;
  if (typeof v === 'string') {
    const rgx = /^(\d{4})-(\d{2})-(\d{2})$/g;
    if (rgx.exec(v)) {
      const t = end ? '23:50:59' : '00:00:00';
      const d = new Date(`${v} ${t}+09:00`);
      if (!Number.isNaN(d.getTime())) return d;
    }
  }
  return new Date();
};

const schema = new Schema({
  key: String,
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  from: { type: Date, set: (v) => parseDate(v, false) },
  to: { type: Date, set: (v) => parseDate(v, true) },
  active: { type: Boolean, default: true },
}, {
  timestamps: true,
});

module.exports = model('License', schema);
