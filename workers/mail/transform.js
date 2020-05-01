const { parseFrom } = require('../../utils/email');

const getNickname = (data, address) => {
  if (data && data.receive && data.receive.nickname) {
    const nicknameKey = address.replace(/\./g, '_');
    const nickname = data.receive.nickname[nicknameKey];
    if (nickname) return nickname;
  }
  throw new Error(`Nickname not configured for ${address}`);
};

const transformBody = (to, input, data, isHtml) => {
  if (isHtml) {
    // TODO: Image replacement
  }
  const nickname = getNickname(data, to.address);
  return input.split(nickname);
};

const buildPreDeliverPayload = ({
  topic: { key, data }, from: { name, username }, to, subject, text, html,
}) => {
  if (!data || !data.deliver || !data.deliver.domain) {
    throw new Error(`Insufficient topic data for ${key}`);
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
