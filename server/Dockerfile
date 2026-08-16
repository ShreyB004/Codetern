FROM node:20-alpine

WORKDIR /opt/codetern

COPY package.json package-lock.json* ./
RUN npm install --omit=dev --no-fund --no-audit

COPY . .

RUN mkdir -p /opt/codetern/uploads

EXPOSE 4000

CMD ["sh", "-c", "node db/migrate.js && node db/seed.js && node src/index.js"]