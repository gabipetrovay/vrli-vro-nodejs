var debug = require('debug')('shim:opsgenie');

var request = require('request');

var config = require('./config');


/**
 * Execute a vRO workflow given a vRLI alert object.
 */
exports.executeWorkflow = function (vrliAlert, callback) {
    debug('vRLI alert:', JSON.stringify(vrliAlert));

    // TODO for each message in alert
    // TODO collect message.fields
    var message = {};

    // find the tenant name from the VM name
    var vmName = message.fields.vc_vm_name;
    var tenant = vmName.match(/^([a-zA-Z]+)([0-9]+)$/);
    if (!tenant || !tenant[1]) {
        return callback(new Error('Ivalid VM name: ' + vmName));
    }
    tenant = tenant[1].toLowerCase();

    var payload = {
        parameters: [
            {
                value: {
                    string: {
                        value: message.timestamp
                    }
                },
                type: "string",
                name: "timestamp",
                scope: "local"
            },
            {
                value: {
                    string: {
                        value: vmName
                    }
                },
                type: "string",
                name: "vmName",
                scope: "local"
            },
            {
                value: {
                    string: {
                        value: message.fields.vmw_vcenter_id
                    }
                },
                type: "string",
                name: "vmId",
                scope: "local"
            },
            {
                value: {
                    string: {
                        value: message.fields.vc_event_type
                    }
                },
                type: "string",
                name: "eventType",
                scope: "local"
            },
            {
                value: {
                    string: {
                        value: tenant
                    }
                },
                type: "string",
                name: "tenant",
                scope: "local"
            }
        ]
    };

    sdk.alert.create(opsgenieAlert, buildOptions(), (err, alert) => {
        if (err) { return callback(err); }
        debug('OpsGenie created alert: ', JSON.stringify(alert));
        return callback(null, alert);
    });

    var url = 'https://' + config.vro.apiEndpointFqdn + ':' + config.vro.apiEndpointPort + '/vco/api/workflows/' + config.vro.workflowId + '/executions';
    debug('Requesting to vRO endpoint - URL: ' + url + ' POST body: ' + JSON.stringify(payload));
    var authHeader = new Buffer(config.vro.username).toString('base64') + ':' + config.vro.password;

    request({
        method: 'POST',
        url: url,
        headers: {
            'Authorization': 'Basic ' + authHeader
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
