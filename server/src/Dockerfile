FROM node:12-slim
WORKDIR .
COPY package.json .
RUN npm install
COPY . .
CMD ["npm", "run", "dev"]
EXPOSE 5000