# Dockerfile
FROM node:18

WORKDIR /app

COPY package*.json ./

# Skopiuj również katalog prisma
COPY prisma ./prisma
COPY . .

RUN npm install

EXPOSE 5000

CMD ["npm", "start"]
