# FROM php:8.3.3-apache

# # 1. Install System Deps + Node.js (Upgraded to Node 22 LTS)
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

# # 2. Install PHP extensions (Added zip)
# RUN docker-php-ext-configure intl \
#     && docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd zip intl
# RUN a2enmod rewrite

# # 3. Install Composer
# COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# WORKDIR /var/www/html
# COPY . .

# # 4. Install PHP dependencies (CRITICAL: Added --no-scripts)
# # This prevents Laravel from crashing during build due to missing ENV vars
# ENV COMPOSER_MEMORY_LIMIT=-1
# RUN composer install --no-interaction --no-dev --optimize-autoloader --no-scripts

# # 5. Build React Assets
# RUN npm install
# RUN npm run build

# # 6. Permissions (Added public/storage for safety)
# RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache /var/www/html/public
# RUN chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache /var/www/html/public

# # 7. Apache Config
# ENV APACHE_DOCUMENT_ROOT /var/www/html/public
# RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf
# RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf

# EXPOSE 80

# # 8. Start Command (Wait for migration, then start Apache)
# CMD php artisan migrate --force && apache2-foreground


FROM php:8.3.3-apache

# Accept build arguments for Vite
ARG VITE_REVERB_APP_KEY
ARG VITE_REVERB_HOST
ARG VITE_REVERB_PORT
ARG VITE_REVERB_SCHEME
ARG VITE_APP_NAME

# Set as environment variables for the build
ENV VITE_REVERB_APP_KEY=$VITE_REVERB_APP_KEY
ENV VITE_REVERB_HOST=$VITE_REVERB_HOST
ENV VITE_REVERB_PORT=$VITE_REVERB_PORT
ENV VITE_REVERB_SCHEME=$VITE_REVERB_SCHEME
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
    && update-ca-certificates

# 2. Install PHP extensions
RUN docker-php-ext-configure intl \
    && docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd zip intl
RUN a2enmod rewrite

# 3. Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html
COPY . .

# 4. Install PHP dependencies
ENV COMPOSER_MEMORY_LIMIT=-1
RUN composer install --no-interaction --no-dev --optimize-autoloader --no-scripts

# 5. Build React Assets (Environment variables are now available)
RUN npm install
RUN npm run build

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
