FROM node:22-bookworm-slim
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev --no-audit --no-fund && npm cache clean --force

COPY src ./src

ENV NODE_ENV=production
USER node
EXPOSE 3000
CMD ["node", "src/api.js"]
