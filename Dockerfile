FROM iodigital/ubuntu-node-goddard:v1
MAINTAINER Ant Cosentino <ant@io.co.za>

ENV NODE_PORT 8080
ENV NODE_STATUS_JSON http://data.goddard.com/status.json
ENV NODE_NODE_JSON http://data.goddard.com/node.json
ENV NODE_BUILD_JSON http://data.goddard.com/build.json
ENV NODE_APPS_JSON http://data.goddard.com/apps.json
ENV NODE_MEDIA_SYNC_LOG http://data.goddard.com/media_sync.log
ENV NODE_MEDIA_SIZES_LOG http://data.goddard.com/media_sizes.log
ENV NODE_WIFI_PAGE http://192.168.88.10
ENV NODE_ENV production

VOLUME ['/var/goddard']
