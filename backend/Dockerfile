FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
# Use npm ci for reproducible installs and prefer offline to reduce network calls
RUN npm ci --frozen-lockfile --prefer-offline --no-audit --no-fund

FROM deps AS build
COPY . .
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/package.json ./

# Increase npm fetch retry behavior to tolerate transient network errors
RUN npm config set fetch-retries 5 \
 && npm config set fetch-retry-factor 10 \
 && npm config set fetch-retry-mintimeout 10000 \
 && npm config set fetch-retry-maxtimeout 60000

# Attempt npm ci up to 5 times (with backoff) to survive intermittent network failures
RUN set -eux; \
  for i in 1 2 3 4 5; do \
    npm ci --omit=dev --frozen-lockfile --prefer-offline --no-audit && break || \
    { echo "npm ci failed (attempt $i/5), retrying..."; sleep $((i*5)); } ; \
  done

COPY --from=build /app/dist ./dist
EXPOSE 3000
CMD ["node","dist/main.js"]
