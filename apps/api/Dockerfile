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

# Copy node_modules to a temporary location
RUN cp -R node_modules /tmp/node_modules

###########################################
# Final stage: Use PHP to set up the final image
###########################################
FROM php:${PHP_VERSION}-cli-bookworm
WORKDIR /var/www/html

# Create a symlink for node
RUN ln -s /usr/local/bin/node /usr/local/bin/nodejs

# Copy the built application from the installer stage
COPY --from=installer /app ./

# Copy public assets from the installer stage
COPY --link --chown=${USER}:${USER} --from=installer /app/public public

# Copy node_modules from the installer stage
COPY --from=installer /tmp/node_modules ./node_modules

# Ensure utilities.sh is copied before appending to .bashrc
COPY --link --chown=${USER}:${USER} apps/api/deployment/utilities.sh /tmp/utilities.sh
# Append utilities.sh to .bashrc
RUN cat /tmp/utilities.sh >> ~/.bashrc

FROM composer:${COMPOSER_VERSION} AS vendor

FROM php:${PHP_VERSION}-cli-bookworm

LABEL maintainer="SMortexa <seyed.me720@gmail.com>"
LABEL org.opencontainers.image.title="Laravel Octane Dockerfile"
LABEL org.opencontainers.image.description="Production-ready Dockerfile for Laravel Octane"
LABEL org.opencontainers.image.source=https://github.com/exaco/laravel-octane-dockerfile
LABEL org.opencontainers.image.licenses=MIT

ARG WWWUSER=1000
ARG WWWGROUP=1000
ARG TZ=UTC

ENV DEBIAN_FRONTEND=noninteractive \
    TERM=xterm-color \
    WITH_HORIZON=false \
    WITH_SCHEDULER=false \
    OCTANE_SERVER=swoole \
    USER=octane \
    ROOT=/var/www/html \
    COMPOSER_FUND=0 \
    COMPOSER_MAX_PARALLEL_HTTP=24

WORKDIR ${ROOT}

SHELL ["/bin/bash", "-eou", "pipefail", "-c"]

RUN ln -snf /usr/share/zoneinfo/${TZ} /etc/localtime \
    && echo ${TZ} > /etc/timezone

ADD --chmod=0755 https://github.com/mlocati/docker-php-extension-installer/releases/latest/download/install-php-extensions /usr/local/bin/

RUN apt-get update; \
    apt-get upgrade -yqq; \
    apt-get install -yqq --no-install-recommends --show-progress \
    apt-utils \
    curl \
    wget \
    nano \
	git \
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
    # Install puppeteer depedencies
    fonts-liberation \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libc6 \
    libcairo2 \
    libcups2 \
    libdbus-1-3 \
    libexpat1 \
    libfontconfig1 \
    libgbm1 \
    libgcc1 \
    libglib2.0-0 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libstdc++6 \
    libx11-6 \
    libx11-xcb1 \
    libxcb1 \
    libxcomposite1 \
    libxcursor1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxi6 \
    libxrandr2 \
    libxrender1 \
    libxss1 \
    libxtst6 \
    lsb-release \
    wget \
    xdg-utils \
    && apt-get -y autoremove \
    && apt-get clean \
    && docker-php-source delete \
    && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/* \
    && rm /var/log/lastlog /var/log/faillog

# install node
RUN curl -fsSL https://deb.nodesource.com/setup_22.x -o nodesource_setup.sh
RUN bash nodesource_setup.sh
RUN apt-get install -y nodejs

RUN arch="$(uname -m)" \
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

RUN userdel --remove --force www-data \
    && groupadd --force -g ${WWWGROUP} ${USER} \
    && useradd -ms /bin/bash --no-log-init --no-user-group -g ${WWWGROUP} -u ${WWWUSER} ${USER}

RUN chown -R ${USER}:${USER} ${ROOT} /var/{log,run} \
    && chmod -R a+rw ${ROOT} /var/{log,run}

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
COPY --from=installer /tmp/node_modules ./node_modules

RUN mkdir -p \
    storage/framework/{sessions,views,cache,testing} \
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

RUN chmod +x /usr/local/bin/start-container

EXPOSE 8001

RUN mv /tmp/vendor vendor

RUN node node_modules/puppeteer/install.mjs

ENTRYPOINT ["start-container"]