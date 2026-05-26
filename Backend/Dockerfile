FROM node:20-alpine

WORKDIR /app

# Copy package files first to leverage Docker's layer caching
COPY package*.json ./

# Install ALL dependencies (including devDependencies like nodemon)
RUN npm install

# Copy the rest of your backend source code
COPY . .

# Expose your backend port (adjust if your backend runs on a different port)
EXPOSE 5000

# Run the development server command
CMD ["npm", "run", "dev"]
