# -- build stage --
FROM node:20-alpine AS builder
WORKDIR /app

COPY client/package.json ./
RUN npm install

COPY client/ ./
ARG VITE_API_URL=""
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# -- production stage --
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY client/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
