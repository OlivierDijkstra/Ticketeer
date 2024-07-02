#!/bin/sh

envsubst '\$FRONTEND_DOMAIN \$DASHBOARD_DOMAIN \$API_DOMAIN \$API_PORT' < /etc/nginx/conf.d/nginx.conf.template > /etc/nginx/nginx.conf
nginx -g 'daemon off;'