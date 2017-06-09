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

        debug('HTTP headers: %o', req.headers);

        if (req.method !== 'POST') {
            return sendResponse(res, 400, 'Invalid request method: ' + req.method + '. This shim only supports POST requests.');
        }

        if (!body) {
            return sendResponse(res, 400, 'The request payload must not be empty');
        }

        try {
            debug('HTTP body: %s', body);
            req.body = JSON.parse(body);
        } catch (err) {
            return sendResponse(res, 500, err);
        }

        postHandler(req, res);
    });
}).listen(config.https, config.https.port);
debug('Listening on port: %d', config.https.port);

function postHandler (req, res) {
    var statusCode = 200;
    var vrliAlert = req.body;

    debug('New vRLI alert: %s  (%s)', vrliAlert.Url, vrliAlert.AlertName);

    vro.executeWorkflow(vrliAlert, err => {
        if (err) {

            return sendResponse(res, 500, err);
        }
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
    debug(statusCode >= 300 ? 'Error: %d %o' : 'Response: %d %o', statusCode, response);
    res.writeHead(statusCode);
    res.end(response);
}
