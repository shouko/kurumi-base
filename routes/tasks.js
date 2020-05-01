const router = require('express').Router();
const Task = require('../models/Task');

router.get('/', (req, res) => {
  Task.find().limit(req.query.limit || 20).exec((err, docs) => {
    if (err) return res.sendStatus(500);
    return res.json(docs);
  });
});

router.post('/', (req, res) => {
  const { namespace, action, param } = req.body;
  new Task({
    namespace,
    action,
    param,
    state: 0,
    history: [{ state: 0, by: req.user.id, timestamp: new Date() }],
  }).save((err) => {
    if (err) return res.sendStatus(500);
    return res.sendStatus(200);
  });
});

router.post('/:id/lock', (req, res) => {
  Task.findOneAndUpdate({
    _id: req.params.id,
    lock: null,
  }, {
    lock: req.user.id,
  }, (err) => {
    if (err) return res.sendStatus(500);
    return res.sendStatus(200);
  });
});

router.post('/:id/unlock', (req, res) => {
  Task.findOneAndUpdate({
    _id: req.params.id,
    lock: req.user.id,
  }, {
    lock: null,
  }, (err) => {
    if (err) return res.sendStatus(500);
    return res.sendStatus(200);
  });
});

router.patch('/:id', (req, res) => {
  const { state } = req.body;
  Task.findOneAndUpdate({
    _id: req.params.id,
    lock: req.user.id,
  }, {
    state,
    $push: {
      history: {
        state,
        by: req.user.id,
        timestamp: new Date(),
      },
    },
  }, (err) => {
    if (err) return res.sendStatus(500);
    return res.sendStatus(200);
  });
});

router.get('/:id', (req, res) => {
  Task.findOne({ _id: req.params.id }, (err, result) => {
    if (err) return res.sendStatus(500);
    if (!result) return res.sendStatus(404);
    return res.json(result);
  });
});

module.exports = router;
