FROM node:12-slim
WORKDIR  .
COPY package.json .
RUN npm install
COPY . .
CMD ["npm", "start"]
EXPOSE 3000 