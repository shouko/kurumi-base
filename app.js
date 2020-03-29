require('dotenv').config();
const express = require('express');
const bunyan = require('bunyan');
const http = require('http');

const app = express();
app.locals.logger = bunyan.createLogger({ name: 'kurumi-base' });
app.locals.httpAgent = new http.Agent();
app.locals.httpAgent.maxSockets = 10;

app.get('/', (req, res) => res.send('Hello World!'));

app.get('/dcimg/:id', require('./routes/dcimg'));

const port = process.env.PORT || 3000;
app.listen(port, () => app.locals.logger.info(`Listening on port ${port}!`));
