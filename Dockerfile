FROM node:20-alpine

# Set working directory
WORKDIR /usr/src/app

# Copy configuration and package files
COPY package*.json tsconfig.json vite.config.ts index.html firebase-applet-config.json ./

# Copy directories
COPY src ./src
COPY server.ts ./server.ts

# Install dependencies
RUN npm install

# Build client and server bundles
RUN npm run build

# Remove devDependencies to optimize image size
RUN npm prune --production

# Expose port (Cloud Run sets process.env.PORT automatically)
EXPOSE 8080

# Production environment variables
ENV NODE_ENV=production

# Start the Express server
CMD ["node", "dist/server.cjs"]
