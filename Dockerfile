FROM nginx

COPY ./dist /var/www/html
COPY ./nginx/conf/default.conf /etc/nginx/conf.d/default.conf

EXPOSE 80