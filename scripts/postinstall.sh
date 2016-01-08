#!/bin/bash

cd /var/praekelt/goddard-captive-portal
npm install

mkdir -p /var/goddard/apps
ln -s /var/praekelt/goddard-captive-portal /var/goddard/apps/captiveportal-redesign
