# Use Debian-based Node.js image for better compatibility
FROM node:18-slim

WORKDIR /app

# Install build dependencies for argon2
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    build-essential \
    python3 \
    gcc \
    make \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Copy package.json and package-lock.json first for better caching
COPY package*.json ./

# Clean install dependencies
RUN npm ci

# Copy the rest of the application
COPY . .

# Rebuild argon2 from source after copying all files
RUN npm rebuild argon2 --build-from-source

# Create uploads directory with proper permissions
RUN mkdir -p uploads && chmod 755 uploads

# Expose the port the app runs on
EXPOSE 3002

# Start the server
CMD ["node", "index.js"]
