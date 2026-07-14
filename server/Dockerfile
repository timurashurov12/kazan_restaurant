# -- build stage --
FROM node:20-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json ./
COPY server/package.json ./server/
COPY client/package.json ./client/
RUN npm ci

COPY server/ ./server/
WORKDIR /app/server
RUN npx prisma generate
RUN npm run build

# -- production stage --
FROM node:20-alpine
RUN apk add --no-cache vips
WORKDIR /app

COPY server/package.json ./
RUN npm install --omit=dev && npm install prisma --no-save

COPY --from=builder /app/server/dist ./dist
COPY --from=builder /app/server/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

COPY server/entrypoint.sh ./
RUN chmod +x entrypoint.sh

EXPOSE 3000
CMD ["./entrypoint.sh"]
