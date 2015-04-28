
# goddard-captive-portal

to begin the development server, run `npm start`.

##### configuration

- `NODE_PORT` the port to which we will bind the http server
- `NODE_APPS_JSON` path to the applications json file (defaults to `http://goddard/apps.json`)
- `NODE_STATUS_JSON` path to the status json file (defaults to `http://goddard/status.json`)
- `NODE_BUILD_JSON` path to the status json file (defaults to `http://goddard/build.json`)
- `NODE_APPS_ROUTE` the path to attach the applications page
- `NODE_STATUS_ROUTE` the path to attach the status page

##### routes

- `NODE_STATUS_ROUTE` **or** `/status` status page (responds to GET)
- `NODE_APPS_ROUTE` **or** `/` applications page (responds to all methods)
