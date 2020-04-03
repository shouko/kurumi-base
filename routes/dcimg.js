const rp = require('request-promise');
const etag = require('etag');
const config = require('../config');

const ua = 'Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:47.0) Gecko/20100101 Firefox/47.0';
const originalImagePattern = /<img src="([^"]+)" class="original_image" \/>/;
const cacheControlString = 'public, max-age=1800, s-maxage=2592000';

function buildRequestUrl(id) {
  return `http://${config.hostname.dcimg}/view/${id}`;
}

function transformKeepHeaders(body, response) {
  return {
    headers: response.headers,
    data: body,
  };
}

module.exports = (req, res) => {
  const { id } = req.params;
  const { logger, httpAgent, storage } = req.app.locals;

  new Promise((resolve, reject) => {
    storage.readFile(config.storageBucket.dcimg, id).then(({ headers, body }) => {
      logger.info('Cached file', id);
      return resolve({ headers, body });
    }).catch(() => {
      logger.info('New ID', id);
      const jar = rp.jar();
      rp({
        uri: buildRequestUrl(id),
        headers: {
          'User-Agent': ua,
        },
        jar,
        pool: httpAgent,
        transform: transformKeepHeaders,
      }).then((response) => {
        const matches = originalImagePattern.exec(response.data);
        if (!matches || matches.length < 2) {
          logger.error(response.headers, response.data);
          throw new Error();
        }
        return `http://${config.hostname.dcimg}${matches[1]}`;
      }).then((imgurl) => rp({
        uri: imgurl,
        headers: {
          'User-Agent': ua,
        },
        jar,
        pool: httpAgent,
        encoding: null,
        transform: transformKeepHeaders,
      })).then((response) => {
        if (
          typeof (response.headers['content-type']) === 'undefined'
     || response.headers['content-type'].indexOf('image/') !== 0
     || response.data.length === 0
        ) {
          logger.error(response.headers);
          return reject();
        }
        logger.info('Downloaded', id);
        return storage.writeFile(config.storageBucket.dcimg, id, response.data, {
          contentType: response.headers['content-type'],
        }).then(() => {
          logger.info('Saved to storage', id);
          return resolve({
            headers: {
              'content-type': response.headers['content-type'],
              'cache-control': cacheControlString,
              etag: etag(response.data),
            },
            body: response.data,
          });
        });
      });
    });
  }).then(({ headers, body }) => {
    res.header('Content-Length', headers['content-length']);
    res.header('Content-Type', headers['content-type']);
    res.header('ETag', headers.etag);
    res.header('Cache-Control', cacheControlString);
    res.status(200);
    res.send(body);
  }).catch((err) => {
    logger.error(err);
    return res.status(404).end('Not Found');
  });
};
