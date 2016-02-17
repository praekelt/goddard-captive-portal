FROM iodigital/ubuntu-node-goddard:v1
MAINTAINER Ant Cosentino <ant@io.co.za>

ENV NODE_ENV production
ENV NODE_PORT 8080
ENV GODDARD_STATUS_JSON http://data.goddard.com/status.json
ENV GODDARD_NODE_JSON http://data.goddard.com/node.json
ENV GODDARD_BUILD_JSON http://data.goddard.com/build.json
ENV GODDARD_APPS_JSON http://data.goddard.com/apps.json
ENV GODDARD_MEDIA_RSYNC http://data.goddard.com/media_rsync.log
ENV GODDARD_MEDIA_DU_HUMAN http://data.goddard.com/media_du_human.log
ENV GODDARD_MEDIA_DU_MACHINE http://data.goddard.com/media_du_machine.log
ENV GODDARD_WIFI_PAGE http://192.168.88.10
ENV GODDARD_WHITELIST_PATH http://data.goddard.com/whitelist

VOLUME ['/var/goddard']
