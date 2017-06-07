var debug = require('debug')('shim:opsgenie');

var request = require('request');

var config = require('./config');


/**
 * Execute a vRO workflow given a vRLI alert object.
 */
exports.executeWorkflow = function (vrliAlert, callback) {
    debug('vRLI alert:', JSON.stringify(vrliAlert));

    var payload = {
        // TODO
    };

    sdk.alert.create(opsgenieAlert, buildOptions(), (err, alert) => {
        if (err) { return callback(err); }
        debug('OpsGenie created alert: ', JSON.stringify(alert));
        return callback(null, alert);
    });

    // TODO extract configurable parts
    var url = 'https://dsrv00vrobsi.sccloudinfra.net:8281/vco/api/workflows/932fd175-7e2d-4485-bb4a-7c392a5a9a82/executions';
    debug('Requesting to vRO endpoint - URL: ' + url + ' POST body: ' + JSON.stringify(payload));

    request({
        method: 'POST',
        url: url,
        headers: {
            'Authorization': 'Basic dGFhcGVnYTRAc2NjbG91ZGluZnJhLm5ldDpwbEc9MmxTQzI1MDVjcg=='
        },
        json: true,
        body: payload
    }, (err, response, body) => {

        if (err || !response || response.statusCode !== 202) {
            return callback(err || body || 'Did not receive a response with status 202 from vRO');
        }

        return callback(null);
    });
};
