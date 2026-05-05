# NestJS API Dockerfile
FROM node:20-alpine AS development
WORKDIR /app
COPY apps/backend/package.json ./
RUN npm install
COPY apps/backend/ ./
EXPOSE 3001
CMD ["npm", "run", "start:dev"]

FROM node:20-alpine AS production
WORKDIR /app
COPY apps/backend/package.json ./
RUN npm install --production
COPY apps/backend/dist ./dist
EXPOSE 3001
CMD ["node", "dist/main"]
