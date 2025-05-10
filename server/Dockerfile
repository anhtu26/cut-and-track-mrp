# Use Debian-based Node.js image for better compatibility
FROM node:18-slim

WORKDIR /app

# Install build dependencies for argon2
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    build-essential \
    python3 \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Copy package.json and package-lock.json first for better caching
COPY package*.json ./

# Install dependencies and rebuild native modules
RUN npm ci && npm rebuild argon2 --build-from-source

# Copy the rest of the application
COPY . .

# Create uploads directory with proper permissions
RUN mkdir -p uploads && chmod 755 uploads

# Expose the port the app runs on
EXPOSE 3002

# Start the server
CMD ["node", "index.js"]
