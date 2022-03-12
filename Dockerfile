# syntax=dockerfile/dockerfile:1

FROM node:17.7.1

SHELL [ "/bin/bash", "-c" ]

WORKDIR /var/www/server

COPY package*.json ./
RUN npm install; npm install -g nodemon

COPY . .
RUN chmod +x configure && ./configure

EXPOSE 80/tcp
CMD [ "npm", "start" ]
