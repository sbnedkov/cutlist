FROM node:latest
ENV MONGO_URI=mongo://mongo/
WORKDIR /app

RUN npm install -g gulp

RUN npm install
CMD gulp prod
