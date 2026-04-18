FROM php:8.2-apache

WORKDIR /var/www/html

COPY api ./api
COPY includes ./includes
COPY cache ./cache
COPY index.php ./index.php
COPY start.sh /start.sh

RUN chown -R www-data:www-data /var/www/html/cache \
    && chmod -R 775 /var/www/html/cache \
    && chmod +x /start.sh

EXPOSE 10000

CMD ["/start.sh"]