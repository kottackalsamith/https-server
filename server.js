// Whole-script strict mode syntax
'use strict';

// Initialization of modules
var express = require('express');
var bodyParser = require('body-parser');
var morgan = require('morgan');


var http = require('http');

var fs = require('fs');
var https = require('https'); // For creating HTTPS server
var path = require('path');

var config = require('./server.config');

var directoryToServe = '/public';

var app = express();

var oneDay = 86400000;

app.set('httpsPort', config.httpsPort);

var httpsOptions = {
    cert: fs.readFileSync(path.join(__dirname, 'ssl', 'server.crt')),
    key: fs.readFileSync(path.join(__dirname, 'ssl', 'server.key'))
};

// For parsing the form values
app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(bodyParser.json());


// Log every request to the console
app.use(morgan('dev'));

// For serving static assets
app.use(express.static(__dirname + directoryToServe, {
    maxAge: oneDay
}));


// Checking for secure connection or not
// If not secure redirect to the secure connection
function requireHTTPS(req, res, next) {
    if (!req.secure) {
        //This should work for local development as well
        var host = req.get('host');

        // var hostname = req.hostname;
        
        // replace the port in the host
        host = host.replace(/:\d+$/, ":" + app.get('httpsPort'));
        // determine the redirect destination
        var destination = ['https://', host, req.url].join('');

        return res.redirect(destination);
    }
    next();
}


//For redirecting to https
app.use(requireHTTPS);


// Start http Server
var server = http.createServer(app)
    .listen(config.httpPort, config.host, function () {
        var host = server.address().address;
        var port = server.address().port;
        console.log('Server running at http://%s:%s', host, port);
    });

// Start https server
var httpsServer = https.createServer(httpsOptions, app)
    .listen(config.httpsPort, config.host, function () {
        var host = httpsServer.address().address;
        var port = httpsServer.address().port;
        console.log('Server running at https://%s:%s', host, port);
    });