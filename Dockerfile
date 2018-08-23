FROM node:latest
ENV MONGO_URI=mongo://mongo/
WORKDIR /app

RUN npm install -g gulp@4

RUN npm install
CMD gulp prod
