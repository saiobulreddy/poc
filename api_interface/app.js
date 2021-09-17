const express = require('express');
const logger = require('morgan');
const cors = require('cors');
const routes = require('./routes');

const app = express();
const port = 4000;

// Define Express app settings
app.use(cors());
app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(express.static(path.join(__dirname, 'public')));
app.set('title', 'Pharma Supply Chain App');
app.use(logger('dev'));
app.use('/', routes);
app.use('*', (req, res) => { return res.status(404).render("404") });

app.listen(port, () => console.log(`Pharma Supply Chain App listening on port: ${port}!`));
