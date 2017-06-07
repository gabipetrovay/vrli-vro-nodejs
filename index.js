var debug = require('debug')('shim:http');

var https = require('https');

var config = require('./config');
var vro = require('./vro');


https.createServer(config.https, (req, res) => {

    debug(req.method + ' ' + req.url);

    var body = '';

    req.on('data', (data) => {
        body += data.toString();
    });

    req.on('end', () => {

        debug('HTTP headers: ' + JSON.stringify(req.headers));

        if (req.method !== 'POST') {
            return sendResponse(res, 400, 'Invalid request method: ' + req.method + '. This shim only supports POST requests.');
        }

        if (!body) {
            return sendResponse(res, 400, 'The request payload must not be empty');
        }

        try {
            debug('HTTP body: ' + body);
            req.body = JSON.parse(body);
        } catch (err) {
            return sendResponse(res, 500, err);
        }

        postHandler(req, res);
    });
}).listen(config.https, config.https.port);
debug('Listening on port: ' + config.https.port);

function postHandler (req, res) {
    var statusCode = 200;
    var vrliAlert = req.body;

    console.log('New vRLI alert: ' + vrliAlert.alertId + ' (' + vrliAlert.alertName + ')');

    vro.executeWorkflow(vrliAlert, err => {
        if (err) { return sendResponse(res, 500, err); }
        return sendResponse(res, statusCode);
    });
}

function sendResponse (res, statusCode, response) {
    if (typeof response === 'object') {
        if (response instanceof Error) {
            response = { error: response.toString() };
        }
        response = JSON.stringify(response);
    }
    debug(statusCode >= 300 ? 'Error:' : 'Response:', statusCode, response);
    res.writeHead(statusCode);
    res.end(response);
}
