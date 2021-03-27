echo $NODE_ENV
make
bash setup-ssh.sh
npm i || true
cd /app/node_modules/guillotine-solver
npm install
npm run gulp build
cd /app
npm run gulp dev || true
bash cleanup-ssh.sh
