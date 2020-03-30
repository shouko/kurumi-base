const express = require('express');
const bunyan = require('bunyan');
const http = require('http');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const config = require('./config');

const logger = bunyan.createLogger({ name: 'kurumi-base' });

let dbConnected = false;
const dbConnect = () => {
  mongoose.connect(config.mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
};
dbConnect();

mongoose.connection.on('error', () => {
  logger.error('MongoDB connection error.');
});
mongoose.connection.on('disconnected', () => {
  logger.error('MongoDB disconnected');
  if (!dbConnected) dbConnect();
});
mongoose.connection.on('connected', () => {
  dbConnected = true;
  logger.info('MongoDB connection established');
});
mongoose.connection.on('reconnected', () => {
  logger.info('MongoDB reconnected.');
});

const app = express();
app.locals.logger = logger;
app.locals.httpAgent = new http.Agent();
app.locals.httpAgent.maxSockets = 10;
app.locals.storage = require('./utils/storage');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/', (req, res) => res.send('Hello World!'));

app.get('/dcimg/:id', require('./routes/dcimg'));
app.use('/abmkey', require('./routes/abmkey'));

app.listen(config.port, () => logger.info(`Listening on port ${config.port}!`));

process.on('SIGINT', () => {
  mongoose.connection.close(() => {
    logger.info('Closing MongoDB connection.');
    process.exit(0);
  });
});
