FROM node:14

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

RUN cd node_modules/geoip-lite && npm run-script updatedb license_key=$GEO_LICENSE

RUN apt-get update
RUN apt-get install zip nano

COPY . .

EXPOSE 3000/tcp
EXPOSE 9871/udp

CMD ["RCONPW=$RCONPW" "node", "api.js" ]