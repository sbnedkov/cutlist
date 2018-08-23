FROM node:latest
RUN npm install -g gulp
ENV MONGO_URI=mongo://mongo/
WORKDIR /root
CMD npm install && \
    gulp prod
