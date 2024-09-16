FROM node:18-alpine

WORKDIR /app/

COPY ./prisma ./prisma

COPY .env ./

COPY ./package.json ./

COPY ./tsconfig.json ./


COPY ./package-lock.json ./

RUN npm install 

COPY ./ ./app/

CMD ["npm","run","dev"]

EXPOSE 8080