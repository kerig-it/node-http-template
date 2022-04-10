# syntax=dockerfile/dockerfile:1

# Use the alpine version of the node image (lightweiht, recommended
# for production environments).
FROM node:17.8.0-alpine3.15

# Set the shell used by Docker to Bash.
SHELL [ "/bin/bash", "-c" ]

# Set a working directory (practically this is the directory where the
# server will end up in the container).
WORKDIR /usr/src/server

# Copy all package files (package.json and package-lock.json) to the
# earlier set working directory.
COPY package*.json ./

# Install only those dependencies necessary in the production
# environment.
RUN npm ci --only=production

# Copy the rest of the repository's contents the working directory.
COPY . .

# Run the configure file, which will execute a script that will set up
# some things necessary for the server to work correctly.
RUN chmod +x configure && ./configure

# Specify that port 80 should be used when publishing ports during
# container creation.
EXPOSE 80/tcp

# Specify a command to run when the container is initiated.
CMD [ "node", "index.js" ]
