/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/*
 * Copyright (c) 2017, Joyent, Inc.
 */

/*
 * Main entry-point for the Networking API.
 */

'use strict';

var bunyan = require('bunyan');
var napi = require('./lib/napi');
var restify = require('restify');


var log = bunyan.createLogger({
    name: 'napi',
    level: 'debug',
    serializers: restify.bunyan.serializers
});


function exitOnError(err) {
    if (err) {
        var errs = err.hasOwnProperty('ase_errors') ? err.ase_errors : [err];
        for (var e in errs) {
            log.error(errs[e]);
        }
        process.exit(1);
    }
}


var server;
try {
    server = napi.createServer({
        configFile: __dirname + '/config.json',
        log: log
    });
} catch (err) {
    exitOnError(err);
}

server.on('initialized', function _afterConnect() {
    log.info('Server init complete');
});

server.start(function _afterStart() {
    var serverInfo = server.info();
    log.info('%s listening at %s', serverInfo.name, serverInfo.url);
});
