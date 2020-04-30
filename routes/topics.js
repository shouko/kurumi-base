const router = require('express').Router();
const Topic = require('../models/Topic');

/*
const schema = new Schema({
  key: {
    type: String,
    required: true,
    unique: true,
  },
  name: String,
  data: Object,
}, {
  timestamps: true,
});
*/

router.get('/', (req, res) => {
  Topic.find().limit(req.query.limit || 20).exec((err, docs) => {
    if (err) return res.sendStatus(500);
    return res.json(docs);
  });
});

router.post('/', (req, res) => {
  const {
    key, name, data,
  } = req.body;

  new Topic({
    key, name, data,
  }).save((err) => {
    if (err) return res.sendStatus(500);
    return res.sendStatus(200);
  });
});

router.patch('/:id', (req, res) => {
  const { id } = req.params;
  const { name, data } = req.body;
  Topic.findOneAndUpdate({ _id: id }, {
    name,
    data,
  }, (err) => {
    if (err) return res.sendStatus(500);
    return res.sendStatus(200);
  });
});

router.get('/:key', (req, res) => {
  const { key } = req.params;
  Topic.find({ key }, (err, results) => {
    if (err) return res.sendStatus(500);
    return res.json(results);
  });
});

module.exports = router;
