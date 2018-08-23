FROM node:latest
ENV MONGODB_URI=mongodb://mongo/razkroi
WORKDIR /app

RUN npm install -g gulp@4

RUN npm install
CMD gulp prod
