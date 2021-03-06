/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/*
 * Copyright 2017, Joyent, Inc.
 */

/*
 * Test helpers for NAPI unit tests
 */

'use strict';

var assert = require('assert-plus');
var common = require('../lib/common');
var constants = require('../../lib/util/constants');
var mod_server = require('../lib/server');
var util = require('util');
var util_ip = require('../../lib/util/ip');



// --- Globals



var NET_NUM = 2;
var NET_IPS = {};
var NON_OBJECT_PARAMS = [
    new Number(5), // eslint-disable-line
    new String('hello'), // eslint-disable-line
    new Boolean(true), // eslint-disable-line
    [ 5 ]
];



// --- Exports


function reset() {
    NET_NUM = 2;
    NET_IPS = {};
    common.resetCreated();
}


/**
 * Copies over all keys in from to to
 */
function copyParams(from, to) {
    for (var k in from) {
        to[k] = from[k];
    }
}


/**
 * Creates a NAPI client pointed at the test server (with req_id for tracking
 * requests)
 */
function createClient(t) {
    return common.createClient(mod_server.get().info().url, t);
}


/**
 * Creates a test NAPI server, and returns a client for accessing it
 */
function createClientAndServer(opts, callback) {
    if (callback === undefined) {
        callback = opts;
        opts = {};
    }

    assert.object(opts, 'opts');
    assert.func(callback, 'callback');

    mod_server._create(opts, function (err, res) {
        if (err) {
            callback(err);
            return;
        }

        callback(null, res.client, res.moray);
    });
}


/**
 * Sorts an error array by field
 */
function fieldSort(a, b) {
    return (a.field > b.field) ? 1 : -1;
}


/**
 * Sorts a list by IP fields
 */
function ipSort(a, b) {
    return (a.ip > b.ip) ? 1 : -1;
}


/**
 * Returns a missing parameter error array element
 */
function missingParam(field, message) {
    assert.string(field, 'field');
    assert.optionalString(message, 'message');

    return {
        code: 'MissingParameter',
        field: field,
        message: message || 'Missing parameter'
    };
}


/**
 * Get the next provisionable IP address for the network object passed in
 */
function nextProvisionableIP(net, willFail) {
    assert.object(net, 'net');
    assert.optionalBool(willFail, 'willFail');

    if (!NET_IPS.hasOwnProperty(net.uuid)) {
        assert.string(net.provision_start_ip, 'net.provision_start_ip');
        NET_IPS[net.uuid] = util_ip.toIPAddr(net.provision_start_ip);
        assert.ok(NET_IPS[net.uuid], 'NET_IPS[net.uuid]');
    }

    var curr = NET_IPS[net.uuid];

    if (!willFail) {
        NET_IPS[net.uuid] = util_ip.ipAddrPlus(curr, 1);
    }

    return curr.toString();
}


/**
 * Returns the parameters for a valid IP, potentially overriding with any
 * values in override
 */
function validIPparams(override) {
    var newIP = {
        belongs_to_type: 'zone',
        belongs_to_uuid: '3c7f5393-7c69-4c7c-bc81-cb7aca031ff1',
        owner_uuid: '930896af-bf8c-48d4-885c-6573a94b1853'
    };

    for (var o in override) {
        newIP[o] = override[o];
    }

    return newIP;
}


/**
 * Returns the parameters for a valid IP, potentially overriding with any
 * values in override
 */
function validNicparams(override) {
    var newNic = {
        belongs_to_type: 'zone',
        belongs_to_uuid: '3c7f5393-7c69-4c7c-bc81-cb7aca031ff1',
        owner_uuid: '930896af-bf8c-48d4-885c-6573a94b1853'
    };

    for (var o in override) {
        newNic[o] = override[o];
    }

    return newNic;
}


/**
 * Returns the parameters for a valid IPv4 network, potentially overriding
 * with any values in override
 */
function validIPv4NetworkParams(override) {
    var newNet = {
        name: 'myname' + NET_NUM,
        nic_tag: 'nic_tag',
        provision_end_ip: util.format('10.0.%d.254', NET_NUM),
        provision_start_ip: util.format('10.0.%d.1', NET_NUM),
        resolvers: ['8.8.8.8', '8.8.4.4'],
        subnet: util.format('10.0.%d.0/24', NET_NUM),
        vlan_id: 0,
        mtu: constants.MTU_DEFAULT
    };

    for (var o in override) {
        newNet[o] = override[o];
    }
    NET_NUM++;

    return newNet;
}

/**
 * Returns the parameters for a valid IPv6 network, potentially overriding
 * with any values in override
 */
function validIPv6NetworkParams(override) {
    var NET_HEX = NET_NUM.toString(16);
    var newNet = {
        name: 'myname' + NET_NUM,
        nic_tag: 'nic_tag',
        provision_end_ip: util.format('fd00:%s::ffff:ffff:ffff:ffff', NET_HEX),
        provision_start_ip: util.format('fd00:%s::1', NET_HEX),
        resolvers: ['2001:4860:4860::8888', '2001:4860:4860::8844'],
        subnet: util.format('fd00:%s::/64', NET_HEX),
        vlan_id: 0,
        mtu: constants.MTU_DEFAULT
    };

    for (var o in override) {
        newNet[o] = override[o];
    }
    NET_NUM++;

    return newNet;
}

module.exports = {
    copyParams: copyParams,
    createClient: createClient,
    createClientAndServer: createClientAndServer,
    fieldSort: fieldSort,
    ifErr: common.ifErr,
    invalidParamErr: common.invalidParamErr,
    ipSort: ipSort,
    missingParamErr: common.missingParamErr,
    missingParam: missingParam,
    nextProvisionableIP: nextProvisionableIP,
    NON_OBJECT_PARAMS: NON_OBJECT_PARAMS,
    get NET_NUM() {
        return NET_NUM;
    },
    randomMAC: common.randomMAC,
    reqOpts: common.reqOpts,
    reset: reset,
    uuidSort: common.uuidSort,
    validIPparams: validIPparams,
    validNicparams: validNicparams,
    validIPv6NetworkParams: validIPv6NetworkParams,
    validNetworkParams: validIPv4NetworkParams
};
