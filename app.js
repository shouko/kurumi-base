const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const config = require('./config');
const logger = require('./services/logger');
const auth = require('./middleware/auth');

let dbConnected = false;
const dbConnect = () => {
  mongoose.connect(config.mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  });
  mongoose.set('useCreateIndex', true);
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
app.disable('x-powered-by');

app.use(bodyParser.urlencoded({ limit: '10240kb', extended: false }));
app.use(bodyParser.json());

app.get('/', (req, res) => res.send('Hello World!'));

app.get('/dcimg/:id', require('./routes/dcimg'));
app.use('/abmkey', auth.devOnly, require('./routes/abmkey'));
app.use('/tasks', auth.devOnly, auth.devMockLogin, require('./routes/tasks'));

// TODO: implement proper auth
app.use('/users', auth.sendgridIncoming, require('./routes/users'));
app.use('/licenses', auth.sendgridIncoming, require('./routes/licenses'));
app.use('/topics', auth.sendgridIncoming, require('./routes/topics'));
app.use('/mails', auth.sendgridIncoming, require('./routes/mails'));

app.use('/hooks', require('./routes/hooks'));

const listener = app.listen(config.port, () => {
  logger.info(`Listening on port ${listener.address().port}!`);
});

process.on('SIGINT', () => {
  mongoose.connection.close(() => {
    logger.info('Closing MongoDB connection.');
    process.exit(0);
  });
});
