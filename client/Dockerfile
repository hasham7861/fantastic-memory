FROM node:12.21.0
WORKDIR  .
COPY package.json .
RUN npm install --silent
RUN npm install react-scripts@3.4.1 -g --silent
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev"]