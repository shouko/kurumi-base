require('dotenv').config();
const express = require('express');
const bunyan = require('bunyan');
const http = require('http');
const mongoose = require('mongoose');

const logger = bunyan.createLogger({ name: 'kurumi-base' });

let dbConnected = false;
const dbConnect = () => {
  mongoose.connect(process.env.MONGODB_URI, {
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

app.get('/', (req, res) => res.send('Hello World!'));

app.get('/dcimg/:id', require('./routes/dcimg'));

const port = process.env.PORT || 3000;
app.listen(port, () => logger.info(`Listening on port ${port}!`));

process.on('SIGINT', () => {
  mongoose.connection.close(() => {
    logger.info('Closing MongoDB connection.');
    process.exit(0);
  });
});
