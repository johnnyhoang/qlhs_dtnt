# Build stage
FROM node:18-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Production stage
FROM node:18-slim

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY --from=build /app/dist ./dist

# Standard Cloud Run port 8080
EXPOSE 8080

ENV NODE_ENV=production

CMD ["node", "dist/index.js"]
