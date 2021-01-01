FROM node:14

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

RUN cd node_modules/geoip-lite && npm run-script updatedb license_key=zGwtu2clq9PDz9R9

RUN apt-get install zip

COPY . .

EXPOSE 3000/tcp
EXPOSE 9871/udp

CMD [ "node", "api.js" ]