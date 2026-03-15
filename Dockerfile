# Use official Node.js LTS image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files and install production dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy application source
COPY server.js ./
COPY public/ ./public/

# Create data directory and set ownership for the non-root node user
RUN mkdir -p data && chown node:node data

# Expose the application port
EXPOSE 3000

# Run as non-root user for security
USER node

# Start the application
CMD ["node", "server.js"]
