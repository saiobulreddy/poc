
const path = require('path');
const logger = require('morgan');
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const feeds = require('./routes/feeds_routes');
const splitter = require('./routes/splitter_routes');
require('./connection');

const app = express();

// view engine setup
app.set('view engine', 'ejs');
app.use(logger('dev'));
app.use(cookieParser());
// ======================================
// # Middlewares
// ======================================
app.use(bodyParser.urlencoded({ extended: true }));
// const options = {
//   inflate: true,
//   limit: 1000,
//   type: ['application/json', 'text/plain', 'text/html']
// };
// app.use(bodyParser.raw(options));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// ======================================
// # Routes
// ======================================
app.use('/', feeds);
app.use('/', splitter);
app.use('*', (req, res) => { return res.status(404).send({ message: `Route not existed with path: ${req.originalUrl}.` }) });

require('./db_connection');
const port = 8080;
app.listen(port, () => { console.log('app listening on http://localhost:' + port) });
