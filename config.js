require('dotenv').config();

module.exports = {
  mongoUri: process.env.MONGODB_URI,
  port: process.env.PORT || 0,
  storageBucket: {
    dcimg: process.env.GCS_BUCKET_DCIMG,
  },
  hostname: {
    dcimg: process.env.HOSTNAME_DCIMG,
  },
};
