FROM nginx:mainline-alpine3.18-slim

COPY frontend-dist /var/www/glissando/
COPY favicon.ico favicon.png /var/www/glissando/
COPY native-dist /var/www/glissando/static/wasm
COPY nginx.conf proxy.conf mime.types /etc/nginx/
