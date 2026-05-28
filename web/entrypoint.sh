#!/bin/sh
set -e
# Substitute ONLY $PORT — leaving nginx variables ($uri, $host, etc.) intact
envsubst '$PORT' < /tmp/nginx.conf.template > /etc/nginx/conf.d/default.conf
exec nginx -g 'daemon off;'
