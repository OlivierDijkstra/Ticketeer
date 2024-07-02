#!/bin/sh

envsubst '\$DOMAIN \$API_DOMAIN \$API_PORT' < /etc/nginx/conf.d/nginx.conf.template > /etc/nginx/nginx.conf
nginx -g 'daemon off;'