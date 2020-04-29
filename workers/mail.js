const Queue = require('better-queue');
const sendgrid = require('@sendgrid/mail');
const config = require('../config');
const logger = require('../services/logger');
const { parseFrom } = require('../utils/email');
const Topic = require('../models/Topic');
const License = require('../models/License');

sendgrid.setApiKey(config.mail.outgoingKey);

const deliver = new Queue(({
  user, from, subject, text, html,
}, cb) => {
  const msg = {
    from,
    to: user.email.address,
    subject,
  };
  if (text) msg.text = text.join(user.nickname);
  if (html) msg.html = html.join(user.nickname);

  sendgrid
    .send(msg)
    .then(() => cb(null))
    .catch((e) => cb(e));
});

const incoming = new Queue(({
  from, subject, text, html,
}, cb) => {
  const {
    name,
    address,
    username,
  } = parseFrom(from);

  const textTransformed = text; // TODO: Image replacement
  const htmlTransformed = html;

  Topic.findOne({ key: `mail:${address}` }, (err, topic) => {
    if (err) return cb(err);
    if (!topic) {
      logger.info(`No suitable topic for ${address}`);
      return cb();
    }
    return License.find({
      key: topic.key,
      from: { $gte: new Date() },
      to: { $lte: new Date() },
    }).populate('user').exec((error, licenses) => {
      if (error) return cb(err);
      if (!licenses || licenses.length === 0) {
        logger.info(`No active license for ${topic.key}`);
        return cb(null);
      }
      return licenses.forEach(({ user }) => {
        deliver.push({
          from: `${name} <${username}@${config.mail.domain}>`.trim(),
          user,
          subject,
          text: text ? textTransformed.split('NICKNAME_PLACEHOLDER') : null, // TODO: Nickname placeholder
          html: html ? htmlTransformed.split('NICKNAME_PLACEHOLDER') : null,
        });
      });
    });
  });
});

module.exports = {
  push: (input) => incoming.push(input),
};
