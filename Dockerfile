FROM node:20

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
RUN npm install

# Install ts-node-dev globally for hot reload
RUN npm install -g ts-node-dev

# Copy source code
COPY . .

# Expose port
EXPOSE 5000

# Start the app with hot reload
CMD ["npm", "run", "dev"]
# Use ts-node-dev for development