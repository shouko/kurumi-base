const router = require('express').Router();
const Mail = require('../models/Mail');

router.get('/', (req, res) => {
  Mail.find().limit(Number(req.query.limit) || 20).exec((err, docs) => {
    if (err) return res.sendStatus(500);
    return res.json(docs);
  });
});

router.get('/:id', (req, res) => {
  const { id } = req.params;
  Mail.findOne({ _id: id }, (err, result) => {
    if (err) return res.sendStatus(500);
    if (!result) return res.sendStatus(404);
    return res.json(result);
  });
});

module.exports = router;
