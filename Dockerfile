# syntax = docker/dockerfile:1

ARG NODE_VERSION=20
FROM node:${NODE_VERSION}-slim AS base
LABEL fly_launch_runtime="Node.js"
WORKDIR /app
ENV NODE_ENV="production"

# === Build Stage ===
FROM base AS build

RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y build-essential node-gyp pkg-config python-is-python3

COPY package-lock.json package.json ./
RUN npm ci --include=dev
COPY . .
RUN npm run build
RUN npm prune --omit=dev

# === Final Image ===
FROM base

COPY --from=build /app /app

COPY --from=build /app/data/gtfs_lrt_only.db /app/data/gtfs_lrt_only.db
RUN chmod 444 /app/data/gtfs_lrt_only.db

ENV DATABASE_URL="file:///app/data/gtfs_lrt_only.db"

EXPOSE 3000

# Make sure your app reads DATABASE_URL or uses this default

CMD ["node", "./dist/server.js"]
