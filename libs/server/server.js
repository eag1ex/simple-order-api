

const DEBUG = true
const { notify } = require('../utils')
const express = require('express')
const app = express()
const morgan = require('morgan')
const bodyParser = require('body-parser');
const config = require('./config');
const ServerAuth = require('./auth')(app)
const ServerCtrs = require('./controllers')(app)
const cors = require('cors');
let ejs = require('ejs');

app.set('trust proxy', 1); // trust first proxy
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

// for rendering html
app.engine('html', ejs.__express);
app.set('view engine', 'html');


//////////////////////
// Initialize server controllers
new ServerAuth(DEBUG).AppUseAuth()
// Our SimpleOrder application is initialized from `ServerCtrs`
const controllers = new ServerCtrs(DEBUG)

/////////////////////
// set server routes
app.get('/order', controllers.order.bind(ServerCtrs));
// catch all other calls
app.all("*", function (req, res) {
    return res.status(200).json({ success: true, message: 'works fine', url: req.url, status: 200 });
})

/////////////////////
// handle errors
app.use(function (error, req, res, next) {
    //notify({ error }, true)
    res.status(500).json({ error: error.toString(), message: 'server error' })
});

/////////////////////
// Initialize server
app.listen(config.port);
notify({ message: `Server running `, port: config.port })

exports.app = app
