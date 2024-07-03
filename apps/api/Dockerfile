# Set the PHP and Composer versions
ARG PHP_VERSION=8.3
ARG COMPOSER_VERSION=latest
ARG NODE_VERSION=20-alpine

###########################################
# Base stage: Use Node.js to install Turbo globally
###########################################
FROM node:${NODE_VERSION} AS base

# Install Turbo globally
RUN yarn global add turbo

###########################################
# Builder stage: Prune the project using Turbo
###########################################
FROM base AS builder
WORKDIR /app
# Copy all files to the working directory
COPY . .
# Prune the project to optimize the build process
RUN turbo prune api --docker

###########################################
# Installer stage: Install dependencies
###########################################
FROM base AS installer
WORKDIR /app
# Copy pruned package.json and yarn.lock from the builder stage
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/yarn.lock ./yarn.lock
# Install dependencies using the frozen lockfile
RUN yarn install --frozen-lockfile --ignore-scripts

###########################################
# Build stage: Build the project
###########################################
COPY --from=builder /app/out/full/ .
# Run the build command for the API
RUN yarn build

###########################################
# Node.js stage: Install Node.js and npm
###########################################
FROM node:${NODE_VERSION} AS node

###########################################
# Final stage: Use PHP to set up the final image
###########################################
FROM php:${PHP_VERSION}-cli-alpine
WORKDIR /var/www/html

# Create a symlink for node
RUN ln -s /usr/local/bin/node /usr/local/bin/nodejs

# Set environment variables for Browsershot
ENV CHROME_BIN=/usr/bin/chromium-browser \
    CHROME_PATH=/usr/lib/chromium/

# Copy the built application from the installer stage
COPY --from=installer /app ./

# Copy public assets from the installer stage
COPY --link --chown=${USER}:${USER} --from=installer /app/public public

# Ensure utilities.sh is copied before appending to .bashrc
COPY --link --chown=${USER}:${USER} apps/api/deployment/utilities.sh /tmp/utilities.sh
# Append utilities.sh to .bashrc
RUN cat /tmp/utilities.sh >> ~/.bashrc

FROM composer:${COMPOSER_VERSION} AS vendor

FROM php:${PHP_VERSION}-cli-alpine

LABEL maintainer="SMortexa <seyed.me720@gmail.com>"
LABEL org.opencontainers.image.title="Laravel Octane Dockerfile"
LABEL org.opencontainers.image.description="Production-ready Dockerfile for Laravel Octane"
LABEL org.opencontainers.image.source=https://github.com/exaco/laravel-octane-dockerfile
LABEL org.opencontainers.image.licenses=MIT

ARG WWWUSER=1000
ARG WWWGROUP=1000
ARG TZ=UTC

ENV TERM=xterm-color \
    WITH_HORIZON=false \
    WITH_SCHEDULER=false \
    OCTANE_SERVER=swoole \
    USER=octane \
    ROOT=/var/www/html \
    COMPOSER_FUND=0 \
    COMPOSER_MAX_PARALLEL_HTTP=24

WORKDIR ${ROOT}

SHELL ["/bin/sh", "-eou", "pipefail", "-c"]

RUN ln -snf /usr/share/zoneinfo/${TZ} /etc/localtime \
  && echo ${TZ} > /etc/timezone

ADD --chmod=0755 https://github.com/mlocati/docker-php-extension-installer/releases/latest/download/install-php-extensions /usr/local/bin/

RUN apk update; \
    apk upgrade; \
    apk add --no-cache \
    curl \
    wget \
    nano \
    ncdu \
    procps \
    ca-certificates \
    supervisor \
    libsodium-dev \
    # Install PHP extensions
    && install-php-extensions \
    bz2 \
    pcntl \
    mbstring \
    bcmath \
    sockets \
    pgsql \
    pdo_pgsql \
    opcache \
    exif \
    pdo_mysql \
    zip \
    intl \
    gd \
    redis \
    rdkafka \
    memcached \
    igbinary \
    ldap \
    swoole \
    && docker-php-source delete \
    && rm -rf /var/cache/apk/* /tmp/* /var/tmp/*

# 🔥 This is where I left off. 🔥
# Install dependencies for Browsershot and other tools
RUN apk add --no-cache \
    chromium
    # nss \
    # freetype \
    # harfbuzz \
    # ca-certificates \
    # ttf-freefont \
    # nodejs \
    # npm \
    # # ... (your existing packages)
    # supervisor \
    # libsodium-dev

# Copy Node.js and npm from the node stage
COPY --from=node /usr/local/bin/node /usr/local/bin/
COPY --from=node /usr/local/lib/node_modules /usr/local/lib/node_modules
COPY --from=node /usr/local/bin/npm /usr/local/bin/

RUN arch="$(apk --print-arch)" \
    && case "$arch" in \
    armhf) _cronic_fname='supercronic-linux-arm' ;; \
    aarch64) _cronic_fname='supercronic-linux-arm64' ;; \
    x86_64) _cronic_fname='supercronic-linux-amd64' ;; \
    x86) _cronic_fname='supercronic-linux-386' ;; \
    *) echo >&2 "error: unsupported architecture: $arch"; exit 1 ;; \
    esac \
    && wget -q "https://github.com/aptible/supercronic/releases/download/v0.2.29/${_cronic_fname}" \
    -O /usr/bin/supercronic \
    && chmod +x /usr/bin/supercronic \
    && mkdir -p /etc/supercronic \
    && echo "*/1 * * * * php ${ROOT}/artisan schedule:run --no-interaction" > /etc/supercronic/laravel

RUN addgroup -g ${WWWGROUP} ${USER} \
    && adduser -D -h ${ROOT} -G ${USER} -u ${WWWUSER} -s /bin/sh ${USER}

RUN mkdir -p /var/log/supervisor /var/run/supervisor \
    && chown -R ${USER}:${USER} ${ROOT} /var/log /var/run \
    && chmod -R a+rw ${ROOT} /var/log /var/run

RUN cp ${PHP_INI_DIR}/php.ini-production ${PHP_INI_DIR}/php.ini

USER ${USER}

COPY --link --chown=${USER}:${USER} --from=vendor /usr/bin/composer /usr/bin/composer
COPY --link --chown=${USER}:${USER} apps/api/composer.json apps/api/composer.lock ./

RUN composer install \
    --no-dev \
    --no-interaction \
    --no-autoloader \
    --no-ansi \
    --no-scripts \
    --audit

# Move the vendor directory to a tmp directory
RUN mv vendor /tmp/vendor

COPY --link --chown=${USER}:${USER} apps/api ./
COPY --from=installer /app/apps/api/public/build ./public/build

RUN mkdir -p \
    storage/framework/sessions \
    storage/framework/views \
    storage/framework/cache \
    storage/framework/testing \
    storage/logs \
    bootstrap/cache && chmod -R a+rw storage

COPY --link --chown=${USER}:${USER} apps/api/deployment/supervisord.conf /etc/supervisor/
COPY --link --chown=${USER}:${USER} apps/api/deployment/octane/Swoole/supervisord.swoole.conf /etc/supervisor/conf.d/
COPY --link --chown=${USER}:${USER} apps/api/deployment/supervisord.*.conf /etc/supervisor/conf.d/
COPY --link --chown=${USER}:${USER} apps/api/deployment/php.ini ${PHP_INI_DIR}/conf.d/99-octane.ini
COPY --link --chown=${USER}:${USER} apps/api/deployment/start-container /usr/local/bin/start-container

# Install PHP dependencies using Composer
RUN composer install \
    --classmap-authoritative \
    --no-interaction \
    --no-ansi \
    --no-dev \
    && composer clear-cache

# Make the start-container script executable
RUN chmod +x /usr/local/bin/start-container

# Expose port 8001 for the application
EXPOSE 8001

RUN mv /tmp/vendor vendor

# Set the entrypoint to the start-container script
ENTRYPOINT ["start-container"]