var debug = require('debug')('shim:vro');

var request = require('request');

var config = require('./config');


/**
 * Execute a vRO workflow given a vRLI alert object.
 */
exports.executeWorkflow = function (vrliAlert, callback) {
    debug('vRLI alert: %o', vrliAlert);

    var vrliAlert = prepareAlert(vrliAlert);

    var errors = vrliAlert.errors;
    var messages = vrliAlert.messages;

    var count = messages.length;

    if (!count) {
        return callback({ errors: errors });
    }

    // an alert may contain multiple messages
    messages.forEach(function (message) {

        debug('vRLI message: %o', message);

        var payload = {
            parameters: [
                {
                    value: { string: { value: message.timestamp } },
                    type: 'string',
                    name: 'timestamp',
                    scope: 'local'
                },
                {
                    value: { string: { value: message.fields['vc_vm_name'] } },
                    type: 'string',
                    name: 'vmName',
                    scope: 'local'
                },
                {
                    value: { string: { value: message.fields['vmw_vcenter_id'] } },
                    type: 'string',
                    name: 'vmId',
                    scope: 'local'
                },
                {
                    value: { string: { value: message.fields['vc_event_type'] } },
                    type: 'string',
                    name: 'eventType',
                    scope: 'local'
                },
                {
                    value: { string: { value: message.fields['tenant'] } },
                    type: 'string',
                    name: 'tenant',
                    scope: 'local'
                }
            ]
        };

        var url = 'https://' + config.vro.apiEndpointFqdn + ':' + config.vro.apiEndpointPort + '/vco/api/workflows/' + config.vro.workflowId + '/executions';
        debug('Sending request to vRO endpoint - URL: %s - POST body: ', url, payload);
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

            if (err) {
                errors.push(err.toString());
            } else if (!response || response.statusCode !== 202) {
                errors.push(body || 'Did not receive a response with status 202 from vRO');
            }

            if (--count === 0) {
                callback(errors.length ? { errors: errors } : null);
            }
        });
    });
};

function prepareAlert (vrliAlert) {

    var messages = [];
    var errors = [];

    if (!vrliAlert.messages || !vrliAlert.messages.length) {
        return callback('Invalid vRLI alert. Expecting at least one message.');
    }

    vrliAlert.messages.forEach(function (message, index) {

        if (!message.fields) {
            errors.push('Invalid vRLI alert message: the message at index ' + index + ' should not have a empty array of fields.');
            return;
        }

        // collect message.fields in an abject
        var fields = {};
        message.fields.forEach(function (field, i) {
            fields[message.fields[i].name] = message.fields[i].content;
        });
        message.fields = fields;

        // check the VM name
        var vmName = message.fields['vc_vm_name'];
        if (!vmName) {
            errors.push('Invalid vRLI alert message: the message at index ' + index + ' does not have a VM name (vc_vm_name)');
            return;
        }

        // find the tenant name from the VM name and save it as a field
        var tenant = vmName.match(/^([a-zA-Z]+)([0-9]+)$/);
        if (!tenant || !tenant[1]) {
            errors.push('Invalid vRLI alert message: the message at index ' + index + ' does not have a valid VM name: ' + vmName);
            return;
        }
        message.fields['tenant'] = tenant[1].toLowerCase();

        // check the vCenter VM ID
        if (!message.fields['vmw_vcenter_id']) {
            errors.push('Invalid vRLI alert message: the message at index ' + index + ' does not have a valid vCenter VM ID (vmw_vcenter_id)');
            return;
        }

        messages.push(message);
    });

    vrliAlert.messages = messages;
    vrliAlert.errors = errors;

    return vrliAlert;
}
