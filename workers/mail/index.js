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

  sendgrid
    .send(msg)
    .then(() => cb(null))
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

  Topic.findOne({ key: `mail:${address}` }, (err, topic) => {
    if (err) return cb(err);
    if (!topic) {
      logger.info(`No suitable topic for ${address}`);
      return cb();
    }

    const preDeliver = buildPreDeliverPayload({
      topic, from: { name, username }, to, subject, text, html,
    });

    return License.find({
      key: topic.key,
      from: { $lte: new Date() },
      to: { $gte: new Date() },
    }).populate('user').exec((error, licenses) => {
      if (error) return cb(err);
      if (!licenses || licenses.length === 0) {
        logger.info(`No active license for ${topic.key}`);
        return cb(null);
      }
      return licenses.forEach(({ user }) => {
        deliver.push({
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
