
# goddard-captive-portal

[![Build Status](https://travis-ci.org/praekelt/goddard-captive-portal.svg)](https://travis-ci.org/praekelt/goddard-captive-portal)
[![Coverage Status](https://coveralls.io/repos/praekelt/goddard-captive-portal/badge.svg?branch=develop)](https://coveralls.io/r/praekelt/goddard-captive-portal?branch=develop)

To begin the development server, run `npm run nodemon`. Otherwise for production, set env vars and then `npm start`.

##### configuration

- `NODE_ENV` execution environment (`prod`, `dev`, etc...)
- `NODE_THENEWAPPS_JSON` path to thenewapps json file
- `NODE_THENEWAPPS_ROUTE` path to attach thenewapps page
- `NODE_HOST_MEDIA` endpoint to query for media availability
- `NODE_PORT` the port to which the http server will be bound
- `NODE_APPS_JSON` path to the apps json file (defaults to `http://data.goddard.com/apps.json`)
- `NODE_STATUS_JSON` path to the status json file (defaults to `http://data.goddard.com/status.json`)
- `NODE_BUILD_JSON` path to the build json file (defaults to `http://data.goddard.com/build.json`)
- `NODE_NODE_JSON` path to the node json file (defaults to `http://data.goddard.com/node.json`)
- `NODE_APPS_ROUTE` the path to attach the applications page
- `NODE_STATUS_ROUTE` the path to attach the status page

##### routes

- `NODE_STATUS_ROUTE` **or** `/status` status page (responds to GET)
- `NODE_APPS_ROUTE` **or** `/` applications page (responds to all methods)
- `/log` access logs (responds to GET and DELETE)

##### todo

- fix up the scripts in package.json (background processes and whatnot...)
- fix up the rewritemanifests function (uses a flag for side effects)
