FROM node:v12.21.0
WORKDIR  .
COPY package.json .
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev"]