const router = require('express').Router();
const multer = require('multer')();
const crypto = require('crypto');
const config = require('../config');
const Mail = require('../models/Mail');
const auth = require('../middleware/auth');
const logger = require('../services/logger');
const worker = require('../workers/mail');

router.get('/mail', (req, res) => res.sendStatus(405));

router.post('/mail', auth.sendgridIncoming, multer.any(), (req, res) => {
  new Mail({
    payload: req.body,
  }).save((err) => {
    if (err) return res.sendStatus(500);
    logger.info(req.body);
    worker.push(req.body);
    return res.sendStatus(200);
  });
});

router.post('/mailgun', multer.any(), (req, res) => {
  try {
    const digest = crypto
      .createHmac('sha256', config.mailgun.signingKey)
      .update(`${req.body.timestamp}${req.body.token}`)
      .digest().toString('hex');
    if (digest !== req.body.signature) {
      throw new Error('Invalid signature');
    }

    const payload = Object.fromEntries(
      Object.entries(req.body)
        .filter(([k]) => !k.startsWith('stripped-'))
        .map(([k, v]) => {
          if (k === 'body-html') return ['html', v];
          if (k === 'body-plain') return ['html', v];
          return [k.toLowerCase(), v];
        }),
    );

    new Mail({
      payload,
    }).save((err) => {
      if (err) return res.sendStatus(500);
      logger.info(req.body);
      worker.push(payload);
      return res.sendStatus(200);
    });
  } catch (e) {
    logger.error(e);
    res.sendStatus(400);
  }
});

module.exports = router;
