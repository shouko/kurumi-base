require('dotenv').config();

module.exports = {
  env: process.env.NODE_ENV || 'development',
  mongoUri: process.env.MONGODB_URI,
  port: process.env.PORT || 0,
  storageBucket: {
    dcimg: process.env.GCS_BUCKET_DCIMG,
  },
  hostname: {
    dcimg: process.env.HOSTNAME_DCIMG,
  },
  mail: {
    incomingKey: process.env.SG_INCOMING_KEY,
    outgoingKey: process.env.SG_OUTGOING_KEY,
    domain: process.env.SG_DOMAIN,
  },
  mailgun: {
    signingKey: process.env.MG_SIGNING_KEY,
    sendingKey: process.env.MG_SENDING_KEY,
    domain: process.env.MG_DOMAIN,
  },
};
