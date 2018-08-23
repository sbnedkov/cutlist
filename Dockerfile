FROM node:latest
ENV MONGO_URI=mongo://mongo/
WORKDIR /app

RUN npm install -g gulp

CMD npm install && \
    gulp prod
