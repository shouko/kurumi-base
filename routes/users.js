const router = require('express').Router();
const User = require('../models/User');

router.get('/', (req, res) => {
  User.find().limit(req.query.limit || 20).exec((err, docs) => {
    if (err) return res.sendStatus(500);
    return res.json(docs);
  });
});

router.post('/', (req, res) => {
  const {
    login, nickname, password, email, birthday,
  } = req.body;

  new User({
    login,
    nickname,
    password,
    email: {
      address: email,
    },
    birthday,
  }).save((err) => {
    if (err) return res.sendStatus(500);
    return res.sendStatus(200);
  });
});

router.patch('/:id', (req, res) => {
  const { id } = req.params;
  const { nickname, password, email } = req.body;
  User.findOneAndUpdate({
    $or: [
      { _id: id },
      { login: id },
    ],
  }, {
    nickname,
    password,
    email: {
      address: email,
      verified: false,
    },
  }, (err) => {
    if (err) return res.sendStatus(500);
    return res.sendStatus(200);
  });
});

router.get('/:id', (req, res) => {
  const { id } = req.params;
  User.findOne({
    $or: [
      { _id: id },
      { login: id },
    ],
  }, (err, result) => {
    if (err) return res.sendStatus(500);
    if (!result) return res.sendStatus(404);
    return res.json(result);
  });
});

module.exports = router;
