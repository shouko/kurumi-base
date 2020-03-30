const router = require('express').Router();
const Abmkey = require('../models/Abmkey');

router.get('/', (req, res) => {
  Abmkey.find((err, docs) => {
    if (err) return res.sendStatus(500);
    return res.json(docs);
  });
});

router.post('/', (req, res) => {
  const { id, payload } = req.body;
  new Abmkey({ id, payload }).save((err) => {
    if (err) return res.sendStatus(500);
    return res.json({ result: 'ok' });
  });
});

router.get('/:id', (req, res) => {
  Abmkey.findOne({ id: req.params.id }, (err, result) => {
    if (err) return res.sendStatus(500);
    if (!result) return res.sendStatus(404);
    res.setHeader('content-type', 'application/octet-stream');
    res.status(200);
    return res.send(result.getBinPayload());
  });
});

module.exports = router;
