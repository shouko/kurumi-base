const { parseFrom } = require('../../utils/email');

const transformBody = (to, input, data, isHtml) => {
  let output = input;
  if (isHtml) {
    // TODO: Image replacement
  }
  if (data && data.receive && data.receive.nickname) {
    const nickname = data.receive.nickname[to.address.replace(/\./g, '_')];
    if (nickname) {
      output = output.split(nickname);
    }
  }
  if (typeof output === 'string') {
    output = [output];
  }
  return output;
};

const buildPreDeliverPayload = ({
  topic: { data }, from: { name, username }, to, subject, text, html,
}) => {
  if (!data || !data.deliver || !data.deliver.domain) {
    return false;
  }

  const deliverName = data.deliver.name ? data.deliver.name : name || '';
  const deliverAddress = `${username}@${data.deliver.domain}`;

  const res = {
    from: `${deliverName} <${deliverAddress}>`.trim(),
    subject,
  };

  const parsedTo = parseFrom(to);
  if (text) res.text = transformBody(parsedTo, text, data, false);
  if (html) res.html = transformBody(parsedTo, html, data, true);

  return res;
};

const buildMessagePayload = ({
  user, from, subject, text, html,
}) => {
  const msg = {
    from,
    to: user.email.address,
    subject,
  };
  if (text) msg.text = text.join(user.nickname || '〇〇');
  if (html) msg.html = html.join(user.nickname || '〇〇');
  return msg;
};

module.exports = {
  transformBody,
  buildPreDeliverPayload,
  buildMessagePayload,
};
