# FROM php:8.3.3-apache

# # Accept build arguments for Vite
# ARG VITE_PUSHER_APP_KEY
# ARG VITE_PUSHER_APP_CLUSTER
# ARG VITE_APP_NAME

# # Set as environment variables for the build
# ENV VITE_PUSHER_APP_KEY=$VITE_PUSHER_APP_KEY
# ENV VITE_PUSHER_APP_CLUSTER=$VITE_PUSHER_APP_CLUSTER
# ENV VITE_APP_NAME=$VITE_APP_NAME

# # 1. Install System Deps + Node.js
# RUN apt-get update && apt-get install -y \
#     libpng-dev \
#     libonig-dev \
#     libxml2-dev \
#     libzip-dev \
#     zip \
#     unzip \
#     git \
#     curl \
#     ca-certificates \
#     && curl -sL https://deb.nodesource.com/setup_22.x | bash - \
#     && apt-get install -y nodejs \
#     && update-ca-certificates

# # 2. Install PHP extensions
# RUN docker-php-ext-configure intl \
#     && docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd zip intl opcache

# RUN { \
#     echo 'opcache.enable=1'; \
#     echo 'opcache.memory_consumption=128'; \
#     echo 'opcache.interned_strings_buffer=8'; \
#     echo 'opcache.max_accelerated_files=10000'; \
#     echo 'opcache.revalidate_freq=2'; \
#     echo 'opcache.fast_shutdown=1'; \
#     echo 'opcache.enable_cli=1'; \
#     } > /usr/local/etc/php/conf.d/opcache.ini

# RUN a2enmod rewrite deflate

# # 3. Install Composer
# COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# WORKDIR /var/www/html
# COPY . .

# # 4. Install PHP dependencies
# ENV COMPOSER_MEMORY_LIMIT=-1
# RUN composer install --no-interaction --no-dev --optimize-autoloader --no-scripts

# # 5. Build React Assets (Environment variables are now available)
# # RUN npm install
# # RUN npm run build
# RUN npm install && npm run build && rm -rf node_modules
# # 6. Permissions
# RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache /var/www/html/public
# RUN chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache /var/www/html/public

# # 7. Apache Config
# ENV APACHE_DOCUMENT_ROOT /var/www/html/public
# RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf
# RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf

# EXPOSE 80

# # 8. Start Command
# CMD apache2-foreground


FROM php:8.3.3-apache

# Accept build arguments for Vite
ARG VITE_PUSHER_APP_KEY
ARG VITE_PUSHER_APP_CLUSTER
ARG VITE_APP_NAME

# Set as environment variables for the build
ENV VITE_PUSHER_APP_KEY=$VITE_PUSHER_APP_KEY
ENV VITE_PUSHER_APP_CLUSTER=$VITE_PUSHER_APP_CLUSTER
ENV VITE_APP_NAME=$VITE_APP_NAME

# 1. Install System Deps + Node.js
RUN apt-get update && apt-get install -y \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    libzip-dev \
    zip \
    unzip \
    git \
    curl \
    ca-certificates \
    && curl -sL https://deb.nodesource.com/setup_22.x | bash - \
    && apt-get install -y nodejs \
    && update-ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# 2. Install PHP extensions + OpCache
RUN docker-php-ext-configure intl \
    && docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd zip intl opcache

# Configure OpCache for Production-like speed on Render
RUN { \
    echo 'opcache.enable=1'; \
    echo 'opcache.memory_consumption=128'; \
    echo 'opcache.interned_strings_buffer=16'; \
    echo 'opcache.max_accelerated_files=20000'; \
    echo 'opcache.revalidate_freq=0'; \
    echo 'opcache.validate_timestamps=0'; \
    echo 'opcache.fast_shutdown=1'; \
    echo 'opcache.enable_cli=1'; \
    echo 'realpath_cache_size=4096K'; \
    echo 'realpath_cache_ttl=600'; \
    } > /usr/local/etc/php/conf.d/opcache.ini

# Enable Apache modules
RUN a2enmod rewrite deflate

# 3. Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html
COPY . .

# 4. Install PHP dependencies
ENV COMPOSER_MEMORY_LIMIT=-1
RUN composer install --no-interaction --no-dev --optimize-autoloader --no-scripts

# 5. Build React Assets
RUN npm install && npm run build && rm -rf node_modules

# 6. Permissions
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache /var/www/html/public
RUN chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache /var/www/html/public

# 7. Apache Config
ENV APACHE_DOCUMENT_ROOT /var/www/html/public
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf

EXPOSE 80

# 8. Start Command
CMD php artisan migrate --force && apache2-foreground