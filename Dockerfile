# Simple approach with Node.js serve
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the React app
RUN npm run build

# Install serve globally to serve static files
RUN npm install -g serve

# Expose port
EXPOSE ${PORT_FE:-3000}

# Start serving the built app
CMD ["serve", "-s", "build", "-l", "3000"]