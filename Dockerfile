FROM node:latest
ENV MONGO_URI=mongo://mongo/
WORKDIR /app

RUN npm install -g gulp

RUN /app/setup-ssh.sh
RUN npm install
RUN /app/cleanup-ssh.sh

CMD gulp prod
