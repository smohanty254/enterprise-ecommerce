FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install --legacy-peer-deps
COPY . .
RUN npm run build

FROM nginx:1.27-alpine
COPY --from=build /app/dist /usr/share/nginx/html

# 1. Copy the environment generator script into the final image
COPY env.sh /env.sh

# 2. Grant execution permissions to the script
RUN chmod +x /env.sh

EXPOSE 80

# 3. Execute the script to generate env-config.js before booting up Nginx
CMD ["/bin/sh", "-c", "/env.sh && nginx -g 'daemon off;'"]
