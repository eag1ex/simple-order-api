

const { notify } = require('../utils')
const express = require('express')
const app = express()
const morgan = require('morgan')
const bodyParser = require('body-parser');
const config = require('./config');
const ServerAuth = require('./auth')(app)
const ServerCtrs = require('./ctrs')(app)
const cors = require('cors');
let ejs = require('ejs');

app.use(morgan('dev'));
app.set('trust proxy', 1); // trust first proxy
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

// for rendering html
app.engine('html', ejs.__express);
app.set('view engine', 'html');


new ServerAuth().AppUseAuth()
const ctr = new ServerCtrs()


// set server routes
app.get('/order', ctr.order.bind(ServerAuth));


// handle errors
app.use(function (error, req, res, next) {
    notify({ error }, true)
    res.status(500).json({ error, success: false, message: 'server error' })
});

app.listen(config.port);
console.log('Server running on port:', port);

module.exports = app;
