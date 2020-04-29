const router = require('express').Router();
const multer = require('multer')();
const Mail = require('../models/Mail');
const auth = require('../middleware/auth');

router.get('/mail', (req, res) => res.sendStatus(405));

router.post('/mail', auth.sendgridIncoming, multer.any(), (req, res) => {
  new Mail({
    payload: req.body,
  }).save((err) => {
    if (err) return res.sendStatus(500);
    return res.sendStatus(200);
  });
});

module.exports = router;
