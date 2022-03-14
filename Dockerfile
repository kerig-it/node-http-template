# syntax=dockerfile/dockerfile:1

FROM node:latest

SHELL [ "/bin/bash", "-c" ]

WORKDIR /var/www/server

COPY package*.json ./
RUN npm install

COPY . .
RUN chmod +x configure && ./configure

EXPOSE 80/tcp
CMD [ "npm", "start" ]
