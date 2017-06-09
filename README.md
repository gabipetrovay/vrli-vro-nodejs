# vRealize Log Insight (vRLI) Shim for vRealize Orchestrator (vRO)

A simple NodeJS shim transforming vRLI alerts into vRO workflow calls. The shim is implemented using the NodeJS HTTPS server.

## Running

The following environment variables must/should be set before running the server:

| Variable | Required | Default | Description |
| -------- | -------- | ------- | ----------- |
| `HTTPS_PORT` | No | `3000` | The port to bind the HRTTPS server to. |
| `HTTPS_SERVER_PEM_FILE` | No | `server.pem` | The PEM file containing both the HTTPS private key and the HTTPS certificate. |
| `VRO_API_ENDPOINT_FQDN` | Yes | | The FQDN of the vRO server where the workflow execution will be started. |
| `VRO_API_ENDPOINT_PORT` | No | 8281 | The port on which the vRO server listens for API requests. |
| `VRO_USERNAME` | Yes | | The name of the user authorized to execute the workflow. |
| `VRO_PASSWORD` | Yes | | The password of the user authorized to execute the workflow. |
| `VRO_WORKFLOW_ID` | Yes | | The ID of the vRO workflow to be executed. |

Sample call:

```
HTTPS_SERVER_PEM_FILE=server.pem \
HTTPS_PORT=5614 \
VRO_API_ENDPOINT_FQDN=dsrv00vrobsi.sccloudinfra.net \
VRO_API_ENDPOINT_PORT=8281 \
VRO_USERNAME=taauser1 \
VRO_PASSWORD=myPassword \
VRO_WORKFLOW_ID=123a456b-789c-012d-345e-6789f0000000 \
node index.js
```
## Debugging logging

The NodeJS [https://www.npmjs.com/package/debug](debug) module is used to print debugging information. The following 3 debuggers have been defined:

* `shim:http` for the HTTPS server requests
* `shim:vro` for the vRLI alert conversion and vRO workflow API requests
* `shim:config` for configuration debug information

To debug a certain module (e.g. `index.js`) use:

```
DEBUG=shim:http ... node index.js
```

To print all debugging information in this webhook implementation, use:

```
DEBUG=shim:* ... node index.js
```

To print all debugging information, including also dependencies, use:

```
DEBUG=* ... node index.js
```

For other `DEBUG` options, check [https://www.npmjs.com/package/debug](debug) module documentation.
