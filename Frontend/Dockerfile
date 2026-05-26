FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# Expose your frontend port (React/Vite typically use 3000 or 5173)
EXPOSE 5173

# Run the development server command
CMD ["npm", "run", "dev", "--", "--host"]
