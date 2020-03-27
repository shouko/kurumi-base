const rp = require('request-promise');
const etag = require('etag');
// const {Storage} = require('@google-cloud/storage');
// const storage = new Storage();

const ua = 'Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:47.0) Gecko/20100101 Firefox/47.0';
const originalImagePattern = /<img src="([^"]+)" class="original_image" \/>/;
const cacheControlString = 'public, max-age=1800, s-maxage=2592000';

// const gcsBucket = storage.bucket('bucketName');

function buildRequestUrl(id) {
  return `http://dcimg.awalker.jp/view/${id}`;
}

function transformKeepHeaders(body, response) {
  return {
    headers: response.headers,
    data: body,
  };
}

module.exports = (req, res) => {
  const { id } = req.params;
  const { logger, httpAgent } = req.app.locals;

  /*
  const remoteReadStream = gcsBucket
    .file(id).createReadStream()
    .on('response', (streamResponse) => {
    console.log('Cached file', id);
    res.header('Content-Length', streamResponse.headers['content-length']);
    res.header('Content-Type', streamResponse.headers['content-type']);
    res.header('ETag', streamResponse.headers.etag);
    res.header('Cache-Control', cacheControlString);
    res.status(200);
  }).on('error', () => {
*/
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
    return `http://dcimg.awalker.jp${matches[1]}`;
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
      throw new Error();
    }
    logger.info('Downloaded', id);
    /*
    const remoteWriteStream = gcsBucket.file(id).createWriteStream({
      metadata: {
        contentType: response.headers['content-type'],
      },
    });
    remoteWriteStream.on('finish', () => {
      console.log('Saved to GCS', id);
    */
    res.header('Content-Type', response.headers['content-type']);
    res.header('Cache-Control', cacheControlString);
    res.header('ETag', etag(response.data));
    return res.status(200).end(response.data);
    /*
    });
    remoteWriteStream.write(response.data);
    remoteWriteStream.end();
    */
  })
    .catch((err) => {
      logger.error(err);
      return res.status(404).end('Not Found');
    });
/*
  })
    .pipe(res);
*/
};
