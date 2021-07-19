
const express = require('express');
const bodyParser = require('body-parser');
const routes = require('./routes');
const app = express();

// ======================================
// # Middlewares
// ======================================
const options = {
    inflate: true,
    limit: 1000,
    type: ['text/plain', 'text/html', 'application/json']
  };
app.use(bodyParser.raw(options))
app.use(bodyParser.urlencoded({ extended: true }))

// ======================================
// # Routes
// ======================================
app.use('/', routes);

const port = 8080;
app.listen(port, () => { console.log('app listening on http://localhost:' + port) });
