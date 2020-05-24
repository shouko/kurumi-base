const sendgrid = require('@sendgrid/mail');
const Mailgun = require('mailgun-js');
const config = require('../config');

const mailgun = Mailgun({ apiKey: config.mailgun.sendingKey, domain: config.mailgun.domain });
sendgrid.setApiKey(config.mail.outgoingKey);

const send = (payload, provider) => new Promise((resolve, reject) => {
  if (provider === 'sendgrid') {
    return sendgrid
      .send(payload)
      .then((res) => resolve(res))
      .catch((e) => reject(e));
  }
  return mailgun.messages().send(payload, (e, res) => {
    if (e) return reject(e);
    return resolve(res);
  });
});

module.exports = {
  send,
};
