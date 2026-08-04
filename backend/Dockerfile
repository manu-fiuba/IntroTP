FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 5000

# Bandera nativa para leer el archivo .env
CMD ["node", "--env-file=.env", "src/api.js"]
