
# goddard-captive-portal

[![Build Status](https://travis-ci.org/praekelt/goddard-captive-portal.svg)](https://travis-ci.org/praekelt/goddard-captive-portal)
[![Coverage Status](https://coveralls.io/repos/praekelt/goddard-captive-portal/badge.svg?branch=develop)](https://coveralls.io/r/praekelt/goddard-captive-portal?branch=develop)

##### development

```
npm run nodemon
```

##### configuration

environment variable | default value
---- | -------
`NODE_ENV` | `dev`
`NODE_PORT` | `3000`
`NODE_TRAVIS` | `undefined`
`NODE_TEST_FIXTURES` | `undefined`
`NODE_TEST_FIXTURES_PORT` | `3333`
`GODDARD_HOST_MEDIA` | `http://data.goddard.com/media`
`GODDARD_APPS_JSON` | `http://data.goddard.com/apps.json`
`GODDARD_STATUS_JSON` | `http://data.goddard.com/status.json`
`GODDARD_BUILD_JSON` | `http://data.goddard.com/build.json`
`GODDARD_NODE_JSON` | `http://data.goddard.com/node.json`
`GODDARD_MEDIA_RSYNC` | `http://data.goddard.com/media_rsync.log`
`GODDARD_MEDIA_DU_HUMAN` | `http://data.goddard.com/media_du_human.log`
`GODDARD_MEDIA_DU_MACHINE` | `http://data.goddard.com/media_du_machine.log`
`GODDARD_WHITELIST_PATH` | `http://data.goddard.com/whitelist`
`GODDARD_WIFI_PAGE` | `http://192.168.88.10`
`GODDARD_ACCESS_LOG_PATH` | `./access.log`
`GODDARD_APPS_ROUTE` | `/`
`GODDARD_LOG_ROUTE` | `/log`
`GODDARD_STATUS_ROUTE` | `/status`
