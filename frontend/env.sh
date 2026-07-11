#!/bin/sh

# Create the config file in the web server root directory
echo "window._env_ = {" > /usr/share/nginx/html/env-config.js
echo "  VITE_API_BASE_URL: \"$VITE_API_BASE_URL\"," >> /usr/share/nginx/html/env-config.js
echo "};" >> /usr/share/nginx/html/env-config.js
