FROM node:18-alpine

WORKDIR /app

# Copy dependency files
COPY package*.json ./
RUN npm ci --omit=dev

# Copy application source
COPY . .

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=5s \
  CMD wget -qO- http://localhost:5000/health || exit 1

CMD ["npm", "start"]
