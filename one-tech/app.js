var express = require('express');
var app = module.exports.app = exports.app = express();
var path = require('path');

app.use(require('connect-livereload')());

app.use(express.static(path.join(__dirname, '/dist/')));

// app.get('/', function(req, res) {
//     res.sendFile(path.join(__dirname, '/dest/', 'index.html'));
// });

app.listen(7827);