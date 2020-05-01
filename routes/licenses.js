const router = require('express').Router();
const License = require('../models/License');

router.get('/', (req, res) => {
  License.find().limit(req.query.limit || 20).exec((err, docs) => {
    if (err) return res.sendStatus(500);
    return res.json(docs);
  });
});

router.post('/', (req, res) => {
  const {
    key, user, from, to,
  } = req.body;

  new License({
    key, user, from, to,
  }).save((err) => {
    if (err) return res.sendStatus(500);
    return res.sendStatus(200);
  });
});

router.patch('/:id', (req, res) => {
  const { id } = req.params;
  const { from, to, active } = req.body;
  License.findOneAndUpdate({ _id: id }, {
    from,
    to,
    active,
  }, (err) => {
    if (err) return res.sendStatus(500);
    return res.sendStatus(200);
  });
});

router.get('/:key', (req, res) => {
  const { key } = req.params;
  License.find({ key }).populate('user').exec((err, results) => {
    if (err) return res.sendStatus(500);
    return res.json(results);
  });
});

module.exports = router;
