FROM node:latest
ENV MONGO_URI=mongo://mongo/
WORKDIR /app

RUN npm install -g gulp

RUN setup-ssh.sh
RUN npm install
RUN cleanup-ssh.sh

CMD gulp prod
