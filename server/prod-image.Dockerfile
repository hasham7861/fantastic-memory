FROM node:14
WORKDIR /app
COPY package.json /app
RUN yarn install --production=true
COPY . /app