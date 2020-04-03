const config = require('../config');

module.exports = {
  devOnly: (req, res, next) => {
    if (config.env !== 'development') return res.sendStatus(403);
    return next();
  },
};
