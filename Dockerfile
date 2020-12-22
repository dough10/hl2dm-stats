FROM node:14

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

RUN cd node_modules/geoip-lite && npm run-script updatedb license_key=zGwtu2clq9PDz9R9

COPY . .

EXPOSE 3000
EXPOSE 9871

CMD [ "node", "api.js", "> hoedown.log" ]