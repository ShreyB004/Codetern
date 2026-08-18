FROM node:20-alpine

WORKDIR /opt/codetern

COPY package.json package-lock.json* ./
RUN npm install --omit=dev --no-fund --no-audit

COPY . .

# Runtime dirs the app writes to; .dockerignore keeps secrets (.env) out of the image.
RUN mkdir -p /opt/codetern/uploads /opt/codetern/logs && chown -R node:node /opt/codetern

# Non-root runtime: node:alpine ships a `node` (uid 1000) user.
USER node

EXPOSE 4000

CMD ["sh", "-c", "node db/migrate.js && node db/seed.js && node src/index.js"]