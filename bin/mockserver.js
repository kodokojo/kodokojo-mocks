#!/usr/bin/env node
'use strict';
var meow = require('meow');
var mockServer = require('../lib/index.js');
var path = require('path');

var templates = {
    usage: 'Usage'+
    '  $ mockserver <config_file_path>'+
    '\n\r'+
    '\n\r'+
    'Examples'+
    '\n\r'+
    '    $ mockserver config.json'
};

var cli = meow(templates.usage, {
    alias: {}
});

var onStarted = function(state) {};

//

if(typeof cli.input[0] === 'undefined') {
    console.log('Missing configuration path');
} else {
    var server = new mockServer(cli.input[0], path.join(__dirname, '../../..'));
    server.start().then(onStarted)
}