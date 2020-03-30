const { Storage } = require('@google-cloud/storage');

const gcs = new Storage();

const readFile = (bucket, file) => new Promise((resolve, reject) => {
  let headers;
  const buf = [];
  gcs.bucket(bucket).file(file).createReadStream()
    .on('response', (streamResponse) => {
      if (streamResponse.statusCode !== 200) reject();
      headers = streamResponse.headers;
    })
    .on('error', (e) => reject(e))
    .on('data', (d) => { buf.push(d); })
    .on('finish', () => resolve({ headers, body: Buffer.concat(buf) }));
});

const writeFile = (bucket, file, data, metadata) => new Promise((resolve, reject) => {
  const stream = gcs.bucket(bucket).file(file).createWriteStream({ metadata });
  stream.on('error', (e) => reject(e));
  stream.on('finish', () => resolve());
  stream.write(data);
  stream.end();
});

module.exports = {
  readFile,
  writeFile,
};
