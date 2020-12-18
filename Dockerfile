FROM node:14

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .


EXPOSE 3000
EXPOSE 9871

CMD [ "sh", "install.sh" ]