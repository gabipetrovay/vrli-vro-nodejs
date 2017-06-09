var debug = require('debug')('shim:config');

var fs = require('fs');

const DEFAULT_VRO_API_ENDPOINT_PORT = 8281;


// report the use of default values
if (!process.env.HTTPS_SERVER_PEM_FILE) {
    console.error('Missing HTTPS_SERVER_PEM_FILE environment variable. Reading the default HTTPS certificate from: server.pem');
}
if (!process.env.HTTPS_PORT) {
    console.error('Missing HTTPS_PORT environment variable. The default HTTPS port 3000 will be used to listen for incomming requests.');
}
if (!process.env.VRO_API_ENDPOINT_PORT) {
    console.error('Missing VRO_API_ENDPOINT_PORT environment variable. The default vRO API port 8281 will be used.');
}

var config = {
    https: {
        port: process.env.HTTPS_PORT || 3000,
        key: fs.readFileSync(process.env.HTTPS_SERVER_PEM_FILE || 'server.pem'),
        cert: fs.readFileSync(process.env.HTTPS_SERVER_PEM_FILE || 'server.pem')
    },
    vro: {
        username: process.env.VRO_USERNAME,
        password: process.env.VRO_PASSWORD,
        workflowId: process.env.VRO_WORKFLOW_ID,
        apiEndpointFqdn: process.env.VRO_API_ENDPOINT_FQDN,
        apiEndpointPort: process.env.VRO_API_ENDPOINT_PORT || DEFAULT_VRO_API_ENDPOINT_PORT
    }
};

// sanity checks
if (!config.https.key || !config.https.cert) {
    console.error('Incorrect HTTPS server certificate configuration. Both the "https.key" and "https.cert" configuration keys must not be empty. User the HTTPS_SERVER_PEM_FILE environment variable to provide the path to a PEM file containing both the key and the certificate.');
    process.exit(10);
}
if (!config.vro.username) {
    console.error('Missing VRO_USERNAME environment variable. The vRO user name cannot be empty.');
    process.exit(10);
}
if (!config.vro.password) {
    console.error('Missing VRO_PASSWORD environment variable. The vRO password cannot be empty.');
    process.exit(10);
}
if (!config.vro.workflowId) {
    console.error('Missing VRO_WORKFLOW_ID environment variable. The vRO workflow ID cannot be empty.');
    process.exit(10);
}
if (!config.vro.apiEndpointFqdn) {
    console.error('Missing VRO_API_ENDPOINT_FQDN environment variable. The vRO API endpoint.');
    process.exit(10);
}

debug('Using shim configuration: ' + JSON.stringify(config, function (key, value) {
    // don't output private keys or certificates (here read as buffers from file)
    if (value && value.type === 'Buffer' && Array.isArray(value.data)) {
        return 'Buffer(...)';
    }
    // don't output complete API keys in the debug information
    if (key === 'password') {
        return '...';
    }
    return value;
}));

module.exports = config;
