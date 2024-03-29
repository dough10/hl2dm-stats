# hl2dm-stats V:1.2.1

A logparser and stats calculator for HL2DM game servers. As seen at [Lo-g DeathMatch Hoedown](https://hl2dm.dough10.me). Parse logs to generate player stats. Stores the data in system memory for fast page response times. Logs player connections into mongodb in order to know who played when and who joined for the first time.

application is still "WIP" track progress [here](https://github.com/dough10/hl2dm-stats/projects/1)

Requires Sourcemod and Superlogs Sourcemod plugin for weapon accuacy stat tracking (weapon stats accuacy is still questionable but better then nothing)

## Documentation

- [make-docs-doc.md](make-docs-doc.md)
  - [api-doc.md](api-doc.md)
  - [modules/auth/auth-doc.md](modules/auth/auth-doc.md)
  - [modules/Timer/Timer-doc.md](modules/Timer/Timer-doc.md)
  - [modules/data-model/data-model-doc.md](modules/data-model/data-model-doc.md)
  - [modules/cacheDemos/cacheDemos-doc.md](modules/cacheDemos/cacheDemos-doc.md)
  - [modules/fileCleanup/fileCleanup-doc.md](modules/fileCleanup/fileCleanup-doc.md)
  - [modules/lineScanner/lineScanner-doc.md](modules/lineScanner/lineScanner-doc.md)
  - [modules/getNewUsers/getNewUsers-doc.md](modules/getNewUsers/getNewUsers-doc.md)
  - [modules/getReturnUsers/getReturnUsers-doc.md](modules/getReturnUsers/getReturnUsers-doc.md)
  - [modules/gameServerStatus/gameServerStatus-doc.md](modules/gameServerStatus/gameServerStatus-doc.md)
  - [modules/printer/printer-doc.md](modules/printer/printer-doc.md)
  - [modules/month-name/month-name-doc.md](modules/month-name/month-name-doc.md)
  - [modules/weaponsCheck/weaponsCheck-doc.md](modules/weaponsCheck/weaponsCheck-doc.md)
  - [modules/RconStats/rcon-doc.md](modules/RconStats/rcon-doc.md)
  - [modules/logUser/logUser-doc.md](modules/logUser/logUser-doc.md)
  - [modules/incriment-version/incriment-version-doc.md](modules/incriment-version/incriment-version-doc.md)
  - [modules/loadConfig/loadConfig-doc.md](modules/loadConfig/loadConfig-doc.md)
  - [modules/init/init-doc.md](modules/init/init-doc.md)
  - [modules/mongo-connect/mongo-connect-doc.md](modules/mongo-connect/mongo-connect-doc.md)
  - [modules/streamKey-doc.md](modules/streamKey-doc.md)

## Install

1. clone repo `git clone https://github.com/dough10/hl2dm-stats.git`
2. cd into directory `cd hl2dm-stats`
3. install modules `npm install`
4. configure geoip-lite `cd node_modules/geoip-lite && npm run-script updatedb license_key=your license key` get your key [here](https://support.maxmind.com/account-faq/license-keys/how-do-i-generate-a-license-key/)
5. configure config.json to fit your filesystem and mongodb database `nano configs/config.json`
6. run app `RCONPW=supersecurepassword node api.js` RCONPW = the rcon password of the srcds server
7. if using authorization for /auth endpoint run `node modules/streamKey.js` to configure a user

## Docker

Alternativly you can install using docker

1. clone repo `git clone https://github.com/dough10/hl2dm-stats.git`
2. cd into directory `cd hl2dm-stats`
3. run `docker build -t hl2dm-stats --build-arg RCONPW="rcon password" --build-arg GEO_LICENSE="geo-lite license key" .`
4. run the container `docker run -p 3000:3000 -p 9871:9871 -v 'path to hl2mp folder':/usr/src/app/hl2mp -v 'path to store json history':/usr/src/app/old-top -v 'path to save zip files':/usr/src/app/old-stats hl2dm-stats`

## UI

avaliable from <https://github.com/dough10/hl2dm-stats-ui>

## Dependencies

- bcrypt: ^5.0.1
- clear: ^0.1.0
- colors: ^1.4.0
- compression: ^1.7.4
- express: ^4.17.3
- express-validator: ^6.14.0
- express-ws: ^4.0.0
- figlet: ^1.5.2
- gamedig: ^2.0.28
- geoip-lite: ^1.4.4
- influx: ^5.9.3
- mongodb: ^3.7.3
- node-schedule: ^1.3.3
- pug: ^3.0.2
- readline: ^1.3.0
- srcds-log-receiver: ^1.0.2
- srcds-rcon: ^2.2.1
- steamid: ^1.1.3

## Dev Dependencies

- jsdoc-to-markdown: ^7.1.1
- jshint: ^2.13.4
- version-incrementer: ^0.1.1
