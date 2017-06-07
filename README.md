# vRealize Log Insight (vRLI) Shim for vRealize Orchestrator (vRO)

A simple NodeJS shim transforming vRLI alerts into vRO workflow calls. The shim is implemented using the NodeJS HTTPS server.

## Running

The following environment variables must/should be set before running the server:

| Variable | Required | Default | Description |
| -------- | -------- | ------- | ----------- |
| `HTTPS_PORT` | No | `3000` | The port to bind the HRTTPS server to. |
| `HTTPS_SERVER_PEM_FILE` | No | `server.pem` | The PEM file containing both the HTTPS private key and the HTTPS certificate. |
| `VRO_WORKFLOW_ID` | Yes | | The ID of the vRO workflow to be executed. |

Sample call:

```
HTTPS_PORT=1234 \
VRO_WORKFLOW_ID=123a456b-789c-012d-345e-6789f0000000 \
node index.js
```
