FROM node:16-alpine AS builder

WORKDIR /dok

COPY . .

RUN npm i -g zx && \
    npm i -g .
