const config = require('../config');

module.exports = {
  devOnly: (req, res, next) => {
    if (config.env !== 'development') return res.sendStatus(403);
    return next();
  },
  devMockLogin: (req, res, next) => {
    if (req.headers['x-kurumi-mock-auth']) {
      req.user = {
        id: '5e94910d81a0118cc52e01f8',
      };
    }
    return next();
  },
};
