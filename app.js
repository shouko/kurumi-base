const express = require('express');
const bunyan = require('bunyan');

const app = express();
const logger = bunyan.createLogger({ name: 'kurumi-base' });

app.get('/', (req, res) => res.send('Hello World!'));

const port = process.env.PORT || 3000;
app.listen(port, () => logger.info(`Listening on port ${port}!`));
