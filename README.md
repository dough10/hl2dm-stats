# hl2dm-stats

A logparser and stats calculator for HL2DM game servers. As seen running at <https://hl2dm.dough10.me> Parses logs to generate player stats and stores the data in system memory for fast page response times.

Requires Sourcemod and Superlogs Sourcemod plugin for weapon accuacy stat tracking (weapon stats accuacy is still questionable but better then nothing)

## Documentation

- [api-doc.md](api-doc.md)
  - [modules&#x2F;auth&#x2F;auth-doc.md](modules&#x2F;auth&#x2F;auth-doc.md)
  - [modules&#x2F;Timer&#x2F;Timer-doc.md](modules&#x2F;Timer&#x2F;Timer-doc.md)
  - [modules&#x2F;data-model&#x2F;data-model-doc.md](modules&#x2F;data-model&#x2F;data-model-doc.md)
  - [modules&#x2F;cacheDemos&#x2F;cacheDemos-doc.md](modules&#x2F;cacheDemos&#x2F;cacheDemos-doc.md)
  - [modules&#x2F;fileCleanup&#x2F;fileCleanup-doc.md](modules&#x2F;fileCleanup&#x2F;fileCleanup-doc.md)

## Install

1. clone repo `git clone https://github.com/dough10/hl2dm-stats.git`
2. cd into directory `cd hl2dm-stats`
3. install modules `npm install`
4. configure geoip-lite `cd node_modules/geoip-lite && npm run-script updatedb license_key=your license key` get your key [here](https://support.maxmind.com/account-faq/license-keys/how-do-i-generate-a-license-key/)
5. configure config.json to fit your filesystem `nano config/config.json`
6. run app `node api.js`
7. if using authorization run `node modules/streamKey.js` to configure a user login

## UI

avaliable from <https://github.com/dough10/hl2dm-stats-ui>
