# hl2dm-stats

A logparser and stats calculator for HL2DM game servers. As seen at [Lo-g DeathMatch Hoedown](https://hl2dm.dough10.me). Parse logs to generate player stats. Stores the data in system memory for fast page response times. Logs player connections into mongodb in order to know who played when and who joined for the first time.

application is still "WIP" track progress [here](https://github.com/dough10/hl2dm-stats/projects/1)

Requires Sourcemod and Superlogs Sourcemod plugin for weapon accuacy stat tracking (weapon stats accuacy is still questionable but better then nothing)

## Documentation

- [api-doc.md](api-doc.md)
  - [modules&#x2F;auth&#x2F;auth-doc.md](modules&#x2F;auth&#x2F;auth-doc.md)
  - [modules&#x2F;Timer&#x2F;Timer-doc.md](modules&#x2F;Timer&#x2F;Timer-doc.md)
  - [modules&#x2F;data-model&#x2F;data-model-doc.md](modules&#x2F;data-model&#x2F;data-model-doc.md)
  - [modules&#x2F;cacheDemos&#x2F;cacheDemos-doc.md](modules&#x2F;cacheDemos&#x2F;cacheDemos-doc.md)
  - [modules&#x2F;fileCleanup&#x2F;fileCleanup-doc.md](modules&#x2F;fileCleanup&#x2F;fileCleanup-doc.md)
  - [modules&#x2F;lineScanner&#x2F;lineScanner-doc.md](modules&#x2F;lineScanner&#x2F;lineScanner-doc.md)

## Install

1. clone repo `git clone https://github.com/dough10/hl2dm-stats.git`
2. cd into directory `cd hl2dm-stats`
3. install modules `npm install`
4. configure geoip-lite `cd node_modules/geoip-lite && npm run-script updatedb license_key=your license key` get your key [here](https://support.maxmind.com/account-faq/license-keys/how-do-i-generate-a-license-key/)
5. configure config.json to fit your filesystem and mongodb database `nano configs/config.json`
6. run app `node api.js`
7. if using authorization run `node modules/streamKey.js` to configure a user login

## UI

avaliable from <https://github.com/dough10/hl2dm-stats-ui>

## Dependencies

- bcrypt: ^5.0.0
- clear: ^0.1.0
- colors: ^1.4.0
- compression: ^1.7.4
- express: ^4.17.1
- express-validator: ^6.9.0
- express-ws: ^4.0.0
- figlet: ^1.5.0
- gamedig: ^2.0.23
- geoip-lite: ^1.4.2
- mongodb: ^3.6.3
- node-schedule: ^1.3.2
- readline: ^1.3.0
- srcds-log-receiver: ^1.0.2
- srcds-rcon: ^2.2.1
- steamid: ^1.1.3

## Dev Dependencies

- jsdoc-to-markdown: ^6.0.1
- jshint: ^2.12.0
- mustache: ^4.1.0
