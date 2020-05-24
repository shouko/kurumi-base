const Queue = require('better-queue');
const logger = require('../../services/logger');
const { parseFrom } = require('../../utils/email');
const Topic = require('../../models/Topic');
const License = require('../../models/License');
const { buildPreDeliverPayload, buildMessagePayload } = require('./transform');
const { send } = require('../../services/mail');

const deliver = new Queue(({
  user, from, subject, text, html,
}, cb) => {
  const msg = buildMessagePayload({
    user, from, subject, text, html,
  });

  logger.info(`Sending to ${user.email.address}`);
  logger.info(msg);

  send(msg)
    .then((res) => cb(null, res))
    .catch((e) => cb(e));
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
      licenses.forEach(({ user }) => {
        if (!user || !user.email || !user.email.verified) {
          logger.info(`Skipping unverified user ${user}`);
          return false;
        }
        return deliver.push({
          ...preDeliver,
          user,
        });
      });
      return cb();
    });
  });
});

module.exports = {
  push: (input) => incoming.push(input),
};
