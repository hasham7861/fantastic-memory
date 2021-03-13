# pull official base image
FROM node:14

# set working directory
WORKDIR /app

# install app dependencies
COPY package.json .
RUN yarn

# add app
COPY . .