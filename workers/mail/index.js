const Queue = require('better-queue');
const sendgrid = require('@sendgrid/mail');
const config = require('../../config');
const logger = require('../../services/logger');
const { parseFrom } = require('../../utils/email');
const Topic = require('../../models/Topic');
const License = require('../../models/License');
const { buildPreDeliverPayload, buildMessagePayload } = require('./transform');

sendgrid.setApiKey(config.mail.outgoingKey);

const deliver = new Queue(({
  user, from, subject, text, html,
}, cb) => {
  const msg = buildMessagePayload({
    user, from, subject, text, html,
  });

  logger.info(`Sending to ${user.email.address}`);
  logger.info(msg);

  sendgrid
    .send(msg)
    .then(() => cb(null))
    .catch((e) => {
      logger.error(e);
      cb(e);
    });
});

const incoming = new Queue(({
  from, to, subject, text, html,
}, cb) => {
  const {
    name,
    address,
    username,
  } = parseFrom(from);

  logger.info(`Processing mail from: ${address}, subject: ${subject}`);

  Topic.findOne({ key: `mail:${address}` }, (err, topic) => {
    if (err) {
      logger.error(`Failed to find topic for ${address}`);
      logger.error(err);
      return cb(err);
    }
    if (!topic) {
      logger.info(`No suitable topic for ${address}`);
      return cb();
    }

    let preDeliver;

    try {
      preDeliver = buildPreDeliverPayload({
        topic, from: { name, username }, to, subject, text, html,
      });
    } catch (e) {
      logger.error(e.name, e.message);
      return cb('preDeliver failed');
    }

    logger.info(preDeliver);

    return License.find({
      key: topic.key,
      from: { $lte: new Date() },
      to: { $gte: new Date() },
      active: true,
    }).populate('user').exec((error, licenses) => {
      if (error) {
        logger.error(`Failed to find licenses for ${topic.key}`);
        return cb(err);
      }
      if (!licenses || licenses.length === 0) {
        logger.info(`No active license for ${topic.key}`);
        return cb(null);
      }
      return licenses.forEach(({ user }) => {
        if (!user.email.verified) {
          logger.info(`Skipping unverified email ${user.login}`);
          return false;
        }
        return deliver.push({
          ...preDeliver,
          user,
        });
      });
    });
  });
});

module.exports = {
  push: (input) => incoming.push(input),
};
